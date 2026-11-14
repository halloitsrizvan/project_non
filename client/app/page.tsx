import Image from "next/image";
import Link from "next/link";
import LandingHeader from "@/components/LandingHeader";

const steps = [
  { n: "01", symbol: "✳", title: "Share what you grow", description: "Add your harvest with a photo, available quantity, price, and location. Simple steps make it easy to start." },
  { n: "02", symbol: "↗", title: "Meet the right buyers", description: "Buyers discover fresh local produce and see the details they need before placing an order." },
  { n: "03", symbol: "◎", title: "Grow with support", description: "Local agencies can help farmers get online, manage products, and reach more markets." },
];

const benefits = [
  { n: "01", title: "More market access", description: "Help local growers reach buyers beyond their usual circle." },
  { n: "02", title: "Less produce wasted", description: "Bring attention to available and surplus harvests." },
  { n: "03", title: "Support close to home", description: "Make digital selling easier with agency assistance." },
];

function Brand() {
  return <Link href="/" className="brand" aria-label="vithu home"><Image className="brand-logo" src="/images/vithu-logo.png" alt="" width={36} height={36} />vithu</Link>;
}

export default function Home() {
  return (
    <div className="site-shell">
      <LandingHeader />
      <div className="site-frame">
        <main id="home">
          <section className="hero" aria-labelledby="hero-title">
            <Image src="/images/hero-crop-rows.png" alt="Long, lush rows of green crops across a farm" fill priority sizes="100vw" className="hero-image" />
            <div className="hero-shade" />
            <div className="hero-content">
              <p className="eyebrow eyebrow-light"><span className="eyebrow-line" />A better way to grow together</p>
              <h1 id="hero-title"><span>Cultivating a Better Future</span><span>Through Connected Markets</span><strong>AGRICULTURE</strong></h1>
              <p className="hero-description">A simpler way for farmers to find buyers, sell fresh produce, and make every harvest count.</p>
              <div className="hero-actions">
                <a className="button button-lime" href="#how-it-works">Explore how it works <span aria-hidden="true">↗</span></a>
                <Link className="button button-outline" href="/register?role=farmer">Join as a farmer <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
            <p className="hero-caption"><span />Made for the people who grow our food</p>
            <span className="hero-index" aria-hidden="true">01 / 04</span>
          </section>

          <div className="hero-feature-row" aria-label="What vithu offers">
            <article className="hero-feature-card">
              <div><h2>Better prices for every harvest</h2><p>Reach buyers beyond your local market.</p><Link href="/register?role=farmer">LEARN MORE <span aria-hidden="true">↗</span></Link></div>
              <div className="hero-feature-image"><Image src="/images/farmer-harvest.png" alt="" fill sizes="80px" /></div>
            </article>
            <p className="hero-feature-message">Transforming <em>agriculture</em><br />with smarter connections<br />for a better future.</p>
            <article className="hero-feature-card hero-feature-card-right">
              <div><h2>Fresh supply, closer to you</h2><p>Browse available produce near you.</p><Link href="/register?role=buyer">LEARN MORE <span aria-hidden="true">↗</span></Link></div>
              <div className="hero-feature-image"><Image src="/images/hero-crop-rows.png" alt="" fill sizes="80px" /></div>
            </article>
          </div>

          <section className="intro section-pad" aria-labelledby="intro-title">
            <h2 id="intro-title"><em>At vithu, we bring farmers</em> <span className="intro-inline-image"><Image src="/images/hero-crop-rows.png" alt="" fill sizes="70px" /></span> <em>and buyers together.</em><br />With transparent opportunities and local support, we help every harvest find its place in the market.</h2>
          </section>

          <section id="how-it-works" className="steps-section section-pad" aria-labelledby="steps-title">
            <div className="section-heading"><div><p className="eyebrow">How it works</p><h2 id="steps-title">A clear path from<br />harvest to sale.</h2></div><span aria-hidden="true">↘</span></div>
            <div className="steps-grid">{steps.map(step => <article className="step" key={step.n}><span className="step-number">{step.n}</span><div className="step-icon" aria-hidden="true">{step.symbol}</div><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
          </section>

          <section id="farmers" className="farmer-section" aria-labelledby="farmer-title">
            <div className="farmer-photo"><Image src="/images/farmer-harvest.png" alt="Farmer holding a crate of freshly harvested vegetables" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
            <div className="farmer-content"><p className="eyebrow eyebrow-light">For farmers</p><h2 id="farmer-title">Your hard work deserves a wider market.</h2><p>Show buyers what is ready to sell, keep track of orders, and discover support that may help your farm grow.</p><ul><li>Add a product in simple steps</li><li>See orders and remaining stock</li><li>Find relevant government schemes</li></ul><Link className="button button-lime" href="/register?role=farmer">Start selling <span aria-hidden="true">↗</span></Link></div>
          </section>

          <section id="buyers" className="buyers-section section-pad" aria-labelledby="buyers-title">
            <div className="buyers-copy"><p className="eyebrow">For buyers</p><h2 id="buyers-title">Find fresh supply, closer to the source.</h2><p>See available produce, prices, quantities, and locations in one place. Connect with the farmers behind the harvest and buy with more confidence.</p><Link className="text-link" href="/register?role=buyer">Discover the marketplace <span aria-hidden="true">↗</span></Link></div>
            <div className="buyer-art"><div className="buyer-art-photo"><Image src="/images/fields-hero.png" alt="" fill sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="buyer-art-label"><span>FRESH FROM THE FIELD</span><strong>Every harvest<br />has a destination.</strong></div></div>
          </section>

          <section className="impact-section section-pad" aria-labelledby="impact-title"><div className="section-heading"><div><p className="eyebrow">Built for a stronger food system</p><h2 id="impact-title">More than a place<br />to buy and sell.</h2></div></div><div className="impact-grid">{benefits.map(benefit => <article className="impact-item" key={benefit.n}><span>{benefit.n}</span><h3>{benefit.title}</h3><p>{benefit.description}</p></article>)}</div></section>

          <section className="final-cta" aria-labelledby="final-title"><p className="eyebrow eyebrow-light">Let&apos;s grow together</p><h2 id="final-title">A fresh start for<br />every harvest.</h2><p>Whether you grow food or buy it for your business, there is a place for you here.</p><Link className="button button-lime" href="/register">Get started <span aria-hidden="true">↗</span></Link></section>
        </main>

        <footer className="site-footer"><div><Brand /><p>Connecting good harvests with good opportunities.</p></div><div className="footer-links"><a href="#how-it-works">How it works</a><a href="#farmers">For farmers</a><a href="#buyers">For buyers</a><Link href="/login">Log in</Link><Link href="/register" style={{ fontWeight: 800, color: "var(--forest)" }}>Sign up</Link></div><div className="footer-bottom"><span>© 2026 vithu. All rights reserved.</span><span>Made for every harvest.</span></div></footer>
      </div>
    </div>
  );
}

