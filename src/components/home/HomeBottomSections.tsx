import { Link } from "@tanstack/react-router";
import {
  FacebookLogo,
  InstagramLogo,
  XLogo,
  LinkedinLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";

type HomeBottomSectionsProps = {
  showEditorialSections?: boolean;
};

const articles = [
  {
    image: "/assets/9df2ff42dd27ba657621c304557d1a855a4be6a5.png",
    date: "12 de setembro",
    readingTime: "Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
  },
  {
    image: "/assets/8459204731e6eba9d474cbc8ebc37071360d3ba5.png",
    date: "13 de setembro",
    readingTime: "Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    description: "Conheça criadores que moldam a cultura digital.",
  },
  {
    image: "/assets/2986a7cb16d09de8970824d2dd58bf0bb021702c.png",
    date: "15 de setembro",
    readingTime: "Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    description:
      "Entenda raridade, procedência, direitos autorais e utilidade.",
  },
  {
    image: "/assets/87580f2def9af0ce13f4b6f6ce17bb2449bcfc16.png",
    date: "15 de setembro",
    readingTime: "Leitura de 2 min",
    title: "Como proteger sua carteira",
    description: "Proteja sua carteira, seus ativos e sua identidade.",
  },
];

const benefits = [
  {
    letter: "W",
    title: "Segurança da carteira",
    description:
      "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    letter: "C",
    title: "Criadores em destaque",
    description:
      "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    letter: "D",
    title: "Alertas de lançamentos",
    description:
      "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
];

const profileLinks = [
  "Meu perfil",
  "Minha coleção",
  "Atividade",
  "Estúdio do criador",
  "Lista de interesse",
];

const helpLinks = [
  "Central de ajuda",
  "Como comprar NFTs",
  "Carteira e segurança",
  "Política do mercado",
  "Denunciar item",
];

const collectionLinks = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Utilidade",
];

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>

      <ul>
        {links.map((item) => (
          <li key={item}>
            <a href="#">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KurioFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <Link to="/" className="footer-brand">
            KURIO<span>.</span>
          </Link>

          <p className="footer-tagline">
            Feito para colecionadores, criadores e cultura
          </p>

          <div className="footer-contact">
            <a href="mailto:contato@email.com">contato@email.com</a>
            <a href="tel:+551140028922">+55 11 4002 8922</a>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-main">
          <FooterColumn title="Meu perfil" links={profileLinks} />

          <FooterColumn title="Central de ajuda" links={helpLinks} />

          <FooterColumn title="Coleções" links={collectionLinks} />

          <div className="footer-column footer-social-column">
            <h3>Redes sociais</h3>

            <div className="footer-social-links">
              <a href="#" aria-label="Facebook">
                <FacebookLogo size={19} weight="regular" />
              </a>

              <a href="#" aria-label="Instagram">
                <InstagramLogo size={19} weight="regular" />
              </a>

              <a href="#" aria-label="Twitter">
                <XLogo size={19} weight="regular" />
              </a>

              <a href="#" aria-label="LinkedIn">
                <LinkedinLogo size={19} weight="regular" />
              </a>

              <a href="#" aria-label="YouTube">
                <YoutubeLogo size={19} weight="regular" />
              </a>
            </div>

            <div className="footer-wallets">
              <h3>Carteiras compatíveis</h3>

              <div className="footer-wallet-list">
                <span>MetaMask</span>
                <span>WalletConnect</span>
                <span>Coinbase</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Kurio. Propriedade digital para todos.</span>
      </div>
    </footer>
  );
}

export default function HomeBottomSections({
  showEditorialSections = true,
}: HomeBottomSectionsProps) {
  return (
    <div className="kurio-home-bottom">
      {showEditorialSections && (
        <>
          {/* CARDS PROMOCIONAIS */}
          <section className="kurio-promo-grid">
            <article className="kurio-promo-card">
              <img
                src="/assets/8459204731e6eba9d474cbc8ebc37071360d3ba5.png"
                alt="Coleção de arte digital Kurio"
              />

              <div className="kurio-promo-content">
                <h3>Lançamentos gênesis de edição limitada</h3>

                <p>
                  Colecione edições escassas diretamente dos criadores antes da
                  revelação pública.
                </p>

                <a href="#catalogo">Explorar →</a>
              </div>
            </article>

            <article className="kurio-promo-card kurio-promo-card-reverse">
              <img
                src="/assets/9df2ff42dd27ba657621c304557d1a855a4be6a5.png"
                alt="Arte digital selecionada"
              />

              <div className="kurio-promo-content">
                <h3>Arte digital selecionada e muito mais</h3>

                <p>
                  Explore novos artistas, coleções verificadas e obras digitais
                  que definem o futuro.
                </p>

                <a href="#catalogo">Explorar →</a>
              </div>
            </article>
          </section>

          {/* DIÁRIO DA CUNHAGEM */}
          <section className="kurio-journal" id="diario">
            <div className="kurio-journal-heading">
              <h2>Diário da Cunhagem</h2>

              <p>
                Histórias, guias e insights para colecionadores sobre o universo
                da propriedade digital.
              </p>
            </div>

            <div className="kurio-journal-grid">
              {articles.map((article) => (
                <article className="kurio-journal-card" key={article.title}>
                  <img src={article.image} alt="" />

                  <div className="kurio-journal-content">
                    <div className="kurio-journal-meta">
                      <span>{article.date}</span>
                      <span>{article.readingTime}</span>
                    </div>

                    <h3>{article.title}</h3>

                    <p>{article.description}</p>

                    <a href="#diario" aria-label={`Ler mais: ${article.title}`}>
                      Ler mais →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* BENEFÍCIOS E NEWSLETTER */}
      <section className="kurio-benefits-newsletter">
        <div className="kurio-benefits">
          {benefits.map((benefit) => (
            <article className="kurio-benefit" key={benefit.title}>
              <span className="kurio-benefit-icon">{benefit.letter}</span>

              <h3>{benefit.title}</h3>

              <p>{benefit.description}</p>
            </article>
          ))}
        </div>

        <div className="kurio-newsletter">
          <h3>Antecipe-se ao próximo lançamento</h3>

          <form onSubmit={(event) => event.preventDefault()}>
            <label className="kurio-newsletter-field">
              <span className="sr-only">Seu e-mail</span>

              <input type="email" placeholder="digite seu e-mail..." required />

              <button type="submit">Enviar</button>
            </label>
          </form>

          <p>
            Receba lançamentos selecionados, histórias de criadores e novidades
            do mercado.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <KurioFooter />
    </div>
  );
}
