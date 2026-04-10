export default function BottomBuyBar({ price = "199 000 so'm" }) {
  return (
    <div className="fixed bottom-24 left-0 right-0 z-30">
      <div className="container-mobile px-4">
        <div className="flex items-center justify-between rounded-[26px] border border-white/70 bg-white/95 p-3 shadow-soft backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/95">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Narxi</p>
            <p className="text-lg font-bold text-violet-600">{price}</p>
          </div>
          <button className="btn-primary px-5">Buyurtma berish</button>
        </div>
      </div>
    </div>
  );
}