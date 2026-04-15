import { useEffect, useState } from "react";
import {
  CreditCard,
  MapPin,
  Upload,
  Loader2,
  User,
  Phone,
  PackageCheck,
  Navigation,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store/useUserStore";
import { useCartStore } from "../store/useCartStore";

const API_URL = import.meta.env.VITE_API_URL;

export default function CheckoutPage() {
  const location = useLocation();
  const orderData = location.state || {};

  const { profile } = useUserStore();
  const { items, getTotal, clearCart } = useCartStore();

  const [phone, setPhone] = useState("+998");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [mapData, setMapData] = useState(null);

  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "+998");
      setFullName(
        profile.full_name ||
          `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      );
    }
  }, [profile]);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoadingSettings(true);

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      setSettings(data);
    }

    setLoadingSettings(false);
  }

  function handlePhoneChange(e) {
    let value = e.target.value.replace(/[^\d+]/g, "");
    if (!value.startsWith("+998")) value = "+998";
    setPhone(value);
  }

  function handleReceiptChange(e) {
    const file = e.target.files?.[0];
    if (file) setReceipt(file);
  }

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      setMessage("Joylashuv qo‘llab-quvvatlanmaydi");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;

        setMapData({
          latitude: lat,
          longitude: lng,
          mapUrl,
        });

        setAddress(`Xaritadan tanlangan joylashuv`);
        setMessage("Joylashuv xaritada olindi ✅");
      },
      () => setMessage("Joylashuvni olish rad etildi")
    );
  }

  async function handleSubmit() {
    setMessage("");

    if (!fullName.trim()) return setMessage("Ism kiriting");
    if (!phone.trim() || phone.length < 13) return setMessage("Telefon noto‘g‘ri");
    if (!address.trim()) return setMessage("Manzil kiriting");
    if (!receipt) return setMessage("Chek yuklang");
    if (!orderData.productId) return setMessage("Mahsulot topilmadi");

    setSubmitting(true);

    try {
      const ext = receipt.name.split(".").pop();
      const fileName = `receipt-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(fileName, receipt);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("payment-receipts")
        .getPublicUrl(fileName);

      const receiptUrl = urlData.publicUrl;

      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .insert([
          {
            full_name: fullName,
            phone,
            address_line: address,
            telegram_chat_id: profile?.telegram_id || null,
            latitude: mapData?.latitude || null,
            longitude: mapData?.longitude || null,
            map_url: mapData?.mapUrl || null,
          },
        ])
        .select()
        .single();

      if (addressError) throw addressError;

      let orderTotal = Number(orderData.productPrice || 0);
      let productNameForBot = orderData.productName || "Mahsulot";

      if (orderData.productId === "cart") {
        orderTotal = getTotal();
        productNameForBot = `Savatcha (${items.length} ta mahsulot)`;
      }

      const { data: orderInsert, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            address_id: addressData.id,
            total_amount: orderTotal,
            status: "new",
            payment_status: "pending_review",
            payment_method: "card_transfer",
            receipt_url: receiptUrl,
            notes: `Mahsulot: ${productNameForBot}`,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      await fetch(`${API_URL}/send-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          address,
          productName: productNameForBot,
          productPrice: orderTotal,
          selectedSize: orderData.selectedSize || "",
          deliveryText: orderData.deliveryText || "10-12 kun",
          receiptUrl,
          mapUrl: mapData?.mapUrl || "",
        }),
      });

      if (orderData.productId === "cart") {
        clearCart();
      }

      setMessage("Buyurtma yuborildi ✅");
    } catch (error) {
      console.error(error);
      setMessage(`Xatolik: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const totalPrice =
    orderData.productId === "cart"
      ? getTotal()
      : Number(orderData.productPrice || 0);

  return (
    <MobileLayout title="Buyurtma berish">
      <div className="space-y-4 pb-24">
        <div className="card card-dark p-4 space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="Ism familiya"
          />

          <input
            value={phone}
            onChange={handlePhoneChange}
            className="input"
            placeholder="+998"
          />

          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input min-h-[100px] resize-none"
            placeholder="Manzil"
          />

          <button
            onClick={handleDetectLocation}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-3 font-semibold dark:bg-neutral-800"
          >
            <Navigation size={16} />
            Joylashuvni xaritada olish
          </button>

          {mapData?.mapUrl ? (
            <a
              href={mapData.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-3xl border border-gray-200 dark:border-neutral-800"
            >
              <img
                src={`https://staticmap.openstreetmap.de/staticmap.php?center=${mapData.latitude},${mapData.longitude}&zoom=15&size=600x260&markers=${mapData.latitude},${mapData.longitude},red-pushpin`}
                alt="Xarita"
                className="h-44 w-full object-cover"
              />
            </a>
          ) : null}
        </div>

        <div className="card card-dark p-4">
          <div className="rounded-3xl bg-violet-600 p-4 text-white">
            {loadingSettings ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Yuklanmoqda...
              </div>
            ) : (
              <>
                <p className="text-sm text-violet-100">Karta raqami</p>
                <p className="mt-1 text-xl font-bold tracking-wider">
                  {settings?.card_number || "Karta topilmadi"}
                </p>
                <p className="mt-3 text-sm text-violet-100">Karta egasi</p>
                <p className="font-semibold">
                  {settings?.card_holder_name || "Noma'lum"}
                </p>
              </>
            )}
          </div>

          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-neutral-700">
            <Upload size={22} className="mb-2 text-violet-600" />
            <span className="font-medium">
              {receipt ? receipt.name : "Chek rasmini tanlang"}
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleReceiptChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="card card-dark p-4">
          <div className="flex justify-between text-sm">
            <span>Jami</span>
            <span className="font-bold text-violet-600">
              {totalPrice.toLocaleString()} so'm
            </span>
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl bg-gray-100 p-3 text-sm dark:bg-neutral-800">
              {message}
            </div>
          ) : null}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary mt-5 w-full py-4 text-base font-semibold disabled:opacity-60"
          >
            {submitting ? "Yuborilmoqda..." : "Buyurtma berish"}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}