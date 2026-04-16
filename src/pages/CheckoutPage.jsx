import { useEffect, useState } from "react";
import {
  CreditCard,
  Upload,
  Loader2,
  PackageCheck,
  Navigation,
  User,
  Phone,
  MapPin,
  Wallet,
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
  const [mapData, setMapData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card_transfer");

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
      .maybeSingle();

    if (!error && data) {
      setSettings(data);
    } else {
      console.error("settings xato:", error);
      setSettings(null);
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

        setAddress("Xaritadan tanlangan joylashuv");
        setMessage("Joylashuv olindi ✅");
      },
      () => setMessage("Joylashuvni olish rad etildi")
    );
  }

  async function parseApiResponse(response) {
    const raw = await response.text();
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(raw || "Serverdan noto‘g‘ri javob keldi");
    }
  }

  async function uploadReceiptIfNeeded() {
    if (paymentMethod === "cash") return null;
    if (!receipt) return null;

    const ext = receipt.name.split(".").pop();
    const fileName = `receipt-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-receipts")
      .upload(fileName, receipt);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("payment-receipts")
      .getPublicUrl(fileName);

    return data?.publicUrl || null;
  }

  async function handleSubmit() {
    setMessage("");

    if (!fullName.trim()) return setMessage("Ism kiriting");
    if (!phone.trim() || phone.length < 13) return setMessage("Telefon noto‘g‘ri");
    if (!address.trim()) return setMessage("Manzil kiriting");
    if (!orderData.productId) return setMessage("Mahsulot topilmadi");

    if (paymentMethod === "card_transfer" && !receipt) {
      return setMessage("Karta to‘lovi uchun chek yuklang");
    }

    if (orderData.productId === "cart" && (!items || items.length === 0)) {
      return setMessage("Savatcha bo‘sh");
    }

    setSubmitting(true);

    try {
      const receiptUrl = await uploadReceiptIfNeeded();

      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .insert([
          {
            full_name: fullName,
            phone,
            address_line: address,
            telegram_chat_id: profile?.telegram_id
              ? String(profile.telegram_id)
              : null,
            latitude: mapData?.latitude || null,
            longitude: mapData?.longitude || null,
            map_url: mapData?.mapUrl || null,
          },
        ])
        .select()
        .single();

      if (addressError) throw addressError;

      let orderTotal = 0;
      let orderItems = [];
      let productNameForBot = "";
      let selectedSizeForBot = "";
      let deliveryTextForBot = orderData.deliveryText || "10–15 kun";

      if (orderData.productId === "cart") {
        orderTotal = typeof getTotal === "function" ? getTotal() : 0;

        orderItems = (items || []).map((item) => ({
          product_id: item.id,
          variant_value: item.selectedSize || null,
          quantity: item.quantity,
          price: item.price,
        }));

        productNameForBot = `Savatcha (${items.length} ta mahsulot)`;
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

        productNameForBot = orderData.productName || "Mahsulot";
        selectedSizeForBot = orderData.selectedSize || "";
      }

      const paymentStatus =
        paymentMethod === "cash" ? "pending" : "pending_review";

      const { data: orderInsert, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            address_id: addressData.id,
            total_amount: orderTotal,
            status: "new",
            payment_status: paymentStatus,
            payment_method: paymentMethod,
            receipt_url: paymentMethod === "cash" ? null : receiptUrl,
            notes:
              orderData.productId === "cart"
                ? `Savatcha buyurtmasi (${orderItems.length} ta mahsulot)`
                : `Mahsulot: ${productNameForBot}`,
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

      // MUHIM: endi HAR IKKALA to'lov turida ham botga xabar boradi
      const response = await fetch("/api/send-order", {
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
          selectedSize: selectedSizeForBot,
          deliveryText: deliveryTextForBot,
          receiptUrl: paymentMethod === "cash" ? null : receiptUrl,
          mapUrl: mapData?.mapUrl || "",
          paymentMethod,
          paymentStatus,
        }),
      });

      const result = await parseApiResponse(response);

      if (!response.ok || !result.success) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.message || "Botga yuborilmadi"
        );
      }

      if (orderData.productId === "cart") {
        clearCart();
      }

      setMessage("Buyurtma yuborildi ✅");
      setReceipt(null);
      setAddress("");
      setMapData(null);
    } catch (error) {
      console.error(error);
      setMessage(`Xatolik: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const isCartOrder = orderData.productId === "cart";
  const totalPrice = isCartOrder
    ? typeof getTotal === "function"
      ? getTotal()
      : 0
    : Number(orderData.productPrice || 0);

  return (
    <MobileLayout title="Buyurtma berish">
      <div className="space-y-4 pb-24">
        <div className="card card-dark p-4">
          <div className="mb-4 flex items-center gap-2">
            <PackageCheck size={18} className="text-violet-600" />
            <h2 className="text-lg font-bold">Buyurtma ma'lumoti</h2>
          </div>

          {isCartOrder ? (
            <div className="space-y-3">
              {(items || []).map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize || ""}`}
                  className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70"
                >
                  <p className="font-semibold">{item.name}</p>
                  {item.selectedSize ? (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      O'lcham: {item.selectedSize}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Soni: {item.quantity}
                  </p>
                  <p className="mt-1 font-bold text-violet-600">
                    {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()} so'm
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <p className="font-semibold">
                {orderData.productName || "Mahsulot tanlanmagan"}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                O'lcham: {orderData.selectedSize || "Tanlanmagan"}
              </p>
              <p className="mt-1 font-bold text-violet-600">
                {totalPrice.toLocaleString()} so'm
              </p>
            </div>
          )}
        </div>

        <div className="card card-dark p-4 space-y-3">
          <div className="mb-1 flex items-center gap-2">
            <User size={16} className="text-violet-600" />
            <p className="font-semibold">Mijoz ma'lumotlari</p>
          </div>

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="Ism familiya"
          />

          <div className="flex items-center gap-2">
            <Phone size={16} className="text-violet-600" />
            <input
              value={phone}
              onChange={handlePhoneChange}
              className="input"
              placeholder="+998"
            />
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-3 text-violet-600" />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input min-h-[110px] resize-none"
              placeholder="Manzil"
            />
          </div>

          <button
            onClick={handleDetectLocation}
            className="btn-secondary w-full"
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <Navigation size={16} />
              Joylashuvni aniqlash
            </span>
          </button>

          {mapData?.mapUrl ? (
            <a
              href={mapData.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-violet-600 dark:bg-neutral-800"
            >
              Xaritada ochish
            </a>
          ) : null}
        </div>

        <div className="card card-dark p-4">
          <h2 className="mb-4 text-lg font-bold">To‘lov usuli</h2>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("card_transfer")}
              className={`w-full rounded-3xl border p-4 text-left transition ${
                paymentMethod === "card_transfer"
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} />
                <div>
                  <p className="font-semibold">Karta orqali to‘lov</p>
                  <p className="text-sm opacity-80">
                    To‘lov qilasiz va chek yuklaysiz
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`w-full rounded-3xl border p-4 text-left transition ${
                paymentMethod === "cash"
                  ? "border-violet-600 bg-violet-600 text-white"
                  : "border-gray-200 bg-gray-50 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet size={18} />
                <div>
                  <p className="font-semibold">Naqd to‘lov</p>
                  <p className="text-sm opacity-80">
                    Naqd to‘lov (oldindan)
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {paymentMethod === "card_transfer" ? (
          <div className="card card-dark p-4">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-violet-600" />
              <h2 className="text-lg font-bold">Karta ma'lumoti</h2>
            </div>

            <div className="rounded-3xl bg-violet-600 p-4 text-white">
              {loadingSettings ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Yuklanmoqda...
                </div>
              ) : settings ? (
                <>
                  <p className="text-sm text-violet-100">Karta raqami</p>
                  <p className="mt-1 text-xl font-bold tracking-wider">
                    {settings.card_number || "Karta topilmadi"}
                  </p>

                  <p className="mt-3 text-sm text-violet-100">Karta egasi</p>
                  <p className="font-semibold">
                    {settings.card_holder_name || "Noma'lum"}
                  </p>

                  {settings.phone_primary ? (
                    <>
                      <p className="mt-3 text-sm text-violet-100">Aloqa</p>
                      <p className="font-semibold">{settings.phone_primary}</p>
                    </>
                  ) : null}
                </>
              ) : (
                <div className="text-sm">Settings jadvalida karta ma'lumoti yo‘q</div>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-neutral-700">
              <Upload size={22} className="mb-2 text-violet-600" />
              <span className="font-medium">
                {receipt ? receipt.name : "Chek rasmini tanlang"}
              </span>
              <span className="mt-1 text-sm text-gray-500">
                JPG, PNG yoki PDF
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="card card-dark p-4 text-sm text-gray-300">
            ⚠️ Diqqat: Naqd to‘lov tanlanganda ham buyurtma botga yuboriladi va admin ko‘radi.
          </div>
        )}

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
            type="button"
          >
            {submitting ? "Yuborilmoqda..." : "Buyurtma berish"}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}