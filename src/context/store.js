import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },
    }),
    { name: 'tatos-auth' }
  )
);

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (producto, cantidad = 1) => {
        const items = get().items;
        const existe = items.find((i) => i._id === producto._id);
        if (existe) {
          set({
            items: items.map((i) =>
              i._id === producto._id ? { ...i, cantidad: i.cantidad + cantidad } : i
            ),
          });
        } else {
          set({ items: [...items, { ...producto, cantidad }] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i._id !== id) }),
      updateCantidad: (id, cantidad) =>
        set({
          items: get().items.map((i) => (i._id === id ? { ...i, cantidad } : i)),
        }),
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
      getCount: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'tatos-cart' }
  )
);