import { create } from "zustand";

function loadCart() {
  try {
    const raw = localStorage.getItem("cart");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("cart load xato:", error);
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch (error) {
    console.error("cart save xato:", error);
  }
}

export const useCartStore = create((set, get) => ({
  items: [],

  initCart: () => {
    const items = loadCart();
    set({ items });
  },

  addToCart: (product) => {
    if (!product?.id) return;

    const current = Array.isArray(get().items) ? get().items : [];
    const selectedSize = product.selectedSize || null;

    const existingIndex = current.findIndex(
      (item) => item?.id === product.id && item?.selectedSize === selectedSize
    );

    let updated = [];

    if (existingIndex !== -1) {
      updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: Number(updated[existingIndex].quantity || 1) + 1,
      };
    } else {
      updated = [
        ...current,
        {
          id: product.id,
          name: product.name || "Mahsulot",
          price: Number(product.price || 0),
          image: product.image || "",
          selectedSize,
          quantity: 1,
        },
      ];
    }

    saveCart(updated);
    set({ items: updated });
  },

  removeFromCart: (id, selectedSize = null) => {
    const current = Array.isArray(get().items) ? get().items : [];
    const updated = current.filter(
      (item) => !(item?.id === id && item?.selectedSize === selectedSize)
    );

    saveCart(updated);
    set({ items: updated });
  },

  increaseQuantity: (id, selectedSize = null) => {
    const current = Array.isArray(get().items) ? get().items : [];
    const updated = current.map((item) => {
      if (item?.id === id && item?.selectedSize === selectedSize) {
        return {
          ...item,
          quantity: Number(item.quantity || 1) + 1,
        };
      }
      return item;
    });

    saveCart(updated);
    set({ items: updated });
  },

  decreaseQuantity: (id, selectedSize = null) => {
    const current = Array.isArray(get().items) ? get().items : [];
    const updated = current
      .map((item) => {
        if (item?.id === id && item?.selectedSize === selectedSize) {
          return {
            ...item,
            quantity: Number(item.quantity || 1) - 1,
          };
        }
        return item;
      })
      .filter((item) => Number(item.quantity || 0) > 0);

    saveCart(updated);
    set({ items: updated });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  getTotal: () => {
    const current = Array.isArray(get().items) ? get().items : [];
    return current.reduce((sum, item) => {
      return sum + Number(item?.price || 0) * Number(item?.quantity || 0);
    }, 0);
  },

  getCount: () => {
    const current = Array.isArray(get().items) ? get().items : [];
    return current.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
  },
}));