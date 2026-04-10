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

    if (!value.startsWith("+998")) {
      value = "+998";
    }

    setPhone(value);
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
    }
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

    if (!fullName.trim()) {
      setMessage("Ism kiriting");
      return;
    }

    if (!phone.trim() || phone.length < 13) {
      setMessage("Telefon noto‘g‘ri");
      return;
    }

    if (!address.trim()) {
      setMessage("Manzil kiriting");
      return;
    }

    if (!receipt) {
      setMessage("Chek yuklang");
      return;
    }

    if (!orderData.productId) {
      setMessage("Mahsulot topilmadi");
      return;
    }

    if (orderData.productId === "cart" && items.length === 0) {
      setMessage("Savatcha bo‘sh");
      return;
    }

    setSubmitting(true);

    try {
      const ext = receipt.name.split(".").pop();
      const fileName = `receipt-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(fileName, receipt);

      if (uploadError) {
        throw uploadError;
      }

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

      if (addressError) {
        throw addressError;
      }

      if (profile?.telegram_id) {
        await supabase
          .from("profiles")
          .update({ phone })
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

      const { data: orderDataInsert, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            address_id: addressData.id,
            total_amount: orderTotal,
            status: "new",
            payment_status: "pending_review",
            receipt_url: receiptUrl,
            notes:
              orderData.productId === "cart"
                ? `Savatcha buyurtmasi (${orderItems.length} ta mahsulot)`
                : `Mahsulot: ${orderData.productName}`,
          },
        ])
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      const itemsToInsert = orderItems.map((item) => ({
        order_id: orderDataInsert.id,
        product_id: item.product_id,
        variant_value: item.variant_value,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (orderItemsError) {
        throw orderItemsError;
      }

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
      setFullName("");
      setPhone("+998");
      setAddress("");
      setReceipt(null);
    } catch (err) {
      console.error(err);
      setMessage("Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  const isCartOrder = orderData.productId === "cart";
  const totalPrice = isCartOrder
    ? getTotal()
    : Number(orderData.productPrice || 0);

  return (
    <MobileLayout title="Buyurtma berish">
      <div className="space-y-4 pb-24">
        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Buyurtma ma'lumoti</h2>

          {isCartOrder ? (
            <div className="mt-4 space-y-3">
              {items.length === 0 && (
                <p className="text-sm text-gray-500">Savatcha bo‘sh</p>
              )}

              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70"
                >
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Soni: {item.quantity}
                  </p>
                  <p className="mt-1 text-sm text-violet-600 font-bold">
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
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                O'lcham: {orderData.selectedSize || "Tanlanmagan"}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Narx: {totalPrice.toLocaleString()} so'm
              </p>
            </div>
          )}
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Mijoz ma'lumotlari</h2>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <User size={16} />
                Ism familiya
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Ismingizni kiriting"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Phone size={16} />
                Telefon raqam
              </label>
              <input
                value={phone}
                onChange={handlePhoneChange}
                className="input"
                placeholder="+998"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MapPin size={16} />
                Manzil
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="To'liq manzilni kiriting"
              />
            </div>

            <button onClick={handleDetectLocation} className="btn-secondary w-full">
              Joylashuvni aniqlash
            </button>
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Yetkazib berish haqida</h2>

          <div className="mt-4 grid gap-2">
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <Clock3 size={18} className="text-violet-600" />
              <span className="text-sm">
                Yetkazib berish: {orderData.deliveryText || "10-12 kun"}
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-neutral-800/70">
              <Truck size={18} className="text-violet-600" />
              <span className="text-sm">
                Cargo summasi keyinchalik Telegram yoki telefon orqali aytiladi
              </span>
            </div>
          </div>
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">To'lov ma'lumotlari</h2>

          <div className="mt-4 rounded-3xl bg-violet-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <CreditCard size={18} />
              <span className="font-semibold">Karta orqali to'lov</span>
            </div>

            {loadingSettings ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-violet-100">
                <Loader2 size={16} className="animate-spin" />
                Yuklanmoqda...
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm text-violet-100">Karta raqami</p>
                <p className="mt-1 text-xl font-bold tracking-wider">
                  {settings?.card_number || "Karta topilmadi"}
                </p>

                <p className="mt-3 text-sm text-violet-100">Karta egasi</p>
                <p className="font-semibold">
                  {settings?.card_holder_name || "Noma'lum"}
                </p>

                <p className="mt-3 text-sm text-violet-100">Aloqa uchun</p>
                <p className="font-semibold">
                  {settings?.phone_primary || "+998"}
                </p>
              </>
            )}
          </div>

          <div className="mt-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Upload size={16} />
              To'lov chekini yuklang
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-violet-400 dark:border-neutral-700">
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
        </div>

        <div className="card card-dark p-4">
          <h2 className="text-lg font-bold">Buyurtma xulosasi</h2>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Mahsulot</span>
              <span>{totalPrice.toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Yetkazib berish</span>
              <span>{orderData.deliveryText || "10-12 kun"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cargo</span>
              <span>Keyin bildiriladi</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Jami</span>
              <span className="text-violet-600">
                {totalPrice.toLocaleString()} so'm
              </span>
            </div>
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