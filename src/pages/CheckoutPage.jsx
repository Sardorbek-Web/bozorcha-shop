import { useEffect, useState } from "react";
import {
  CreditCard,
  MapPin,
  Upload,
  User,
  Phone,
  Loader2,
  Clock3,
  Truck,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import MobileLayout from "../components/layout/MobileLayout";
import { supabase } from "../lib/supabase";
import { useUserStore } from "../store/useUserStore";
import { useCartStore } from "../store/useCartStore";

export default function CheckoutPage() {
  const location = useLocation();
  const orderData = location.state || {};

  const { profile } = useUserStore();
  const { items, getTotal, clearCart } = useCartStore();

  const [phone, setPhone] = useState("+998");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [receipt, setReceipt] = useState(null);

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

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^\d+]/g, "");
    if (!value.startsWith("+998")) value = "+998";
    setPhone(value);
  };

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      setMessage("Joylashuv qo‘llab-quvvatlanmaydi");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setAddress(`Latitude: ${lat}, Longitude: ${lng}`);
        setMessage("Joylashuv olindi ✅");
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
    if (orderData.productId === "cart" && items.length === 0) {
      return setMessage("Savatcha bo‘sh");
    }

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
          },
        ])
        .select()
        .single();

      if (addressError) throw addressError;

      if (profile?.telegram_id) {
        await supabase
          .from("profiles")
          .update({ phone, full_name: fullName })
          .eq("telegram_id", profile.telegram_id);
      }

      let orderTotal = 0;
      let orderItems = [];

      if (orderData.productId === "cart") {
        orderTotal = getTotal();
        orderItems = items.map((item) => ({
          product_id: item.id,
          variant_value: item.selectedSize || null,
          quantity: item.quantity,
          price: item.price,
        }));
      } else {
        orderTotal = Number(orderData.productPrice || 0);
        orderItems = [
          {
            product_id: orderData.productId,
            variant_value: orderData.selectedSize || null,
            quantity: 1,
            price: Number(orderData.productPrice || 0),
          },
        ];
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
            notes:
              orderData.productId === "cart"
                ? `Savatcha buyurtmasi (${orderItems.length} ta mahsulot)`
                : `Mahsulot: ${orderData.productName}`,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = orderItems.map((item) => ({
        order_id: orderInsert.id,
        product_id: item.product_id,
        variant_value: item.variant_value,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      await fetch("http://localhost:5000/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          address,
          productName:
            orderData.productId === "cart"
              ? `Savatcha (${items.length} ta mahsulot)`
              : orderData.productName,
          productPrice: orderTotal,
          selectedSize:
            orderData.productId === "cart" ? "" : orderData.selectedSize,
          deliveryText: orderData.deliveryText || "10-12 kun",
          receiptUrl,
        }),
      });

      if (orderData.productId === "cart") {
        clearCart();
      }

      setMessage("Buyurtma yuborildi ✅");
      setReceipt(null);
      setAddress("");
    } catch (error) {
      console.error(error);
      setMessage(`Xatolik: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const isCartOrder = orderData.productId === "cart";
  const totalPrice = isCartOrder ? getTotal() : Number(orderData.productPrice || 0);

  return (
    <MobileLayout title="Buyurtma berish">
      <div className="space-y-4 pb-24">
        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Buyurtma ma'lumoti</h2>

          {isCartOrder ? (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize || ""}`}
                  className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70"
                >
                  <p className="font-semibold">{item.name}</p>
                  {item.selectedSize && (
                    <p className="mt-1 text-sm text-gray-500">O'lcham: {item.selectedSize}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">Soni: {item.quantity}</p>
                  <p className="mt-1 text-sm font-bold text-violet-600">
                    {(item.price * item.quantity).toLocaleString()} so'm
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl bg-gray-50 p-4 dark:bg-neutral-800/70">
              <p className="font-semibold">
                {orderData.productName || "Mahsulot tanlanmagan"}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                O'lcham: {orderData.selectedSize || "Tanlanmagan"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Narx: {totalPrice.toLocaleString()} so'm
              </p>
            </div>
          )}
        </div>

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

          <button onClick={handleDetectLocation} className="btn-secondary w-full">
            Joylashuvni aniqlash
          </button>
        </div>

        <div className="card card-dark p-4">
          <div className="mt-2 rounded-3xl bg-violet-600 p-4 text-white">
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

          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 p-6 text-center">
            <Upload size={22} className="mb-2 text-violet-600" />
            <span className="font-medium">
              {receipt ? receipt.name : "Chek rasmini tanlang"}
            </span>
            <span className="mt-1 text-sm text-gray-500">JPG, PNG yoki PDF</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
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

          {message && (
            <div className="mt-4 rounded-2xl bg-gray-100 p-3 text-sm dark:bg-neutral-800">
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary mt-5 w-full disabled:opacity-60"
          >
            {submitting ? "Yuborilmoqda..." : "Buyurtma berish"}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}