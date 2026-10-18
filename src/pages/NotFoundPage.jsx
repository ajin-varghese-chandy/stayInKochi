import Button from '../components/ui/Button'

// 404 — restrained, editorial, no illustration.
export default function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:py-28">
      <p className="eyebrow text-terracotta">Error 404</p>
      <h1 className="mt-3 font-serif text-4xl text-charcoal sm:text-5xl">
        This room doesn’t exist.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-charcoal/65">
        The page you were looking for has moved or was never here. The branches,
        though, are all in one place.
      </p>
      <div className="mt-7 flex gap-3">
        <Button to="/">Back home</Button>
        <Button to="/hostels" variant="secondary">
          Browse branches
        </Button>
      </div>
    </section>
  )
}
