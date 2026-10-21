// Decorative companion for the branch route on wide screens. It pins beside
// the zig-zag cards so the traveller stays in view while the list scrolls.
export default function BranchCompanion() {
  return (
    <aside className="hidden lg:block" aria-label="About StayInKochi">
      <div className="sticky top-8 xl:top-12">
        <div className="mx-auto w-full max-w-[10.5rem] xl:max-w-[13rem]">
          <img
            src="/hero2.png"
            alt=""
            width="259"
            height="462"
            loading="lazy"
            className="w-full drop-shadow-[0_20px_28px_rgba(41,45,41,0.16)]"
          />
        </div>

        <p className="eyebrow mt-4 text-center text-terracotta xl:mt-5">
          One team, every branch
        </p>
        <p className="mt-2 text-center text-xs leading-relaxed text-charcoal/55 xl:text-sm">
          The same people look after your room, rent and upkeep wherever you
          stay.
        </p>
      </div>
    </aside>
  )
}
