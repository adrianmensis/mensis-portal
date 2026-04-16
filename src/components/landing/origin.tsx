export function Origin() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 sm:px-10">
        <span className="text-xs uppercase tracking-[0.25em] text-brand/60">
          The name
        </span>
        <p className="font-serif text-3xl leading-snug text-brand sm:text-4xl">
          The moon was our first clock.
          <br />
          Its cycle was called{" "}
          <span className="text-brand-light">Mensis</span>.
          <br />
          It still is.
        </p>
      </div>
    </section>
  );
}
