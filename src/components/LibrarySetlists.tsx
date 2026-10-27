import { ArrowRight, ListMusic } from 'lucide-react'

interface SetlistCard {
  id: string
  title: string
  occasion: string
  description: string
  songs: { title: string }[]
}

export function LibrarySetlists({
  setlists,
  onOpen,
}: {
  setlists: SetlistCard[]
  onOpen: (id: string) => void
}) {
  return (
    <section className="library-setlists" aria-labelledby="setlists-heading">
      <div className="library-setlists-heading">
        <div>
          <h2 id="setlists-heading">Seu próximo repertório já tem um começo.</h2>
          <p>
            Escolha a ocasião e siga a ordem sugerida. As músicas podem aparecer em mais de um
            setlist.
          </p>
        </div>
        <span>{setlists.length} setlists prontos</span>
      </div>
      <div className="library-setlist-grid">
        {setlists.map((setlist, index) => (
          <button
            className="library-setlist-card"
            key={setlist.id}
            onClick={() => onOpen(setlist.id)}
            aria-label={`Abrir setlist ${setlist.title}`}
          >
            <span className="library-setlist-card-top">
              <ListMusic size={22} />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </span>
            <span className="library-setlist-occasion">{setlist.occasion}</span>
            <strong>{setlist.title}</strong>
            <span className="library-setlist-description">{setlist.description}</span>
            <span className="library-setlist-preview">
              {setlist.songs
                .slice(0, 3)
                .map((song) => song.title)
                .join(' · ')}
            </span>
            <span className="library-setlist-card-footer">
              <span>{setlist.songs.length} músicas disponíveis</span>
              <span>
                Abrir <ArrowRight size={16} />
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
