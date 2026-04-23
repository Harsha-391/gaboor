import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import emailjs from '@emailjs/browser';

const BAT_SVG = (
  <svg viewBox="0 0 80 32" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="20" rx="4.5" ry="6.5" fill="#d2ccbf" />
    <ellipse cx="40" cy="15" rx="3.5" ry="4.5" fill="#d2ccbf" />
    <path d="M36,13L34,6L38,12ZM44,13L46,6L42,12Z" fill="#d2ccbf" />
    <path className="bwl" d="M35,17C30,9 14,3 2,13C7,12 13,11 17,17C12,17 10,23 14,26C18,22 26,18 35,18Z" fill="#d2ccbf" />
    <path className="bwr" d="M45,17C50,9 66,3 78,13C73,12 67,11 63,17C68,17 70,23 66,26C62,22 54,18 45,18Z" fill="#d2ccbf" />
  </svg>
);

export default function Home() {
  const grainRef = useRef(null);
  const [form, setForm]     = useState({ name: '', phone: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    emailjs.init({ publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY });
  }, []);

  // Draw grain noise once on mount
  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = Math.ceil(window.innerWidth  * 2.6);
    const H = Math.ceil(window.innerHeight * 2.6);
    canvas.width  = W;
    canvas.height = H;
    const img = ctx.createImageData(W, H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  // Field change — clears that field's error
  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  // Validate all fields, returns object of failing fields
  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2)                                       e.name    = true;
    if (form.phone.replace(/\D/g, '').length < 7)                          e.phone   = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))            e.email   = true;
    if (form.message.trim().length < 10)                                   e.message = true;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('sending');
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name.trim(),
          from_phone: form.phone.trim(),
          from_email: form.email.trim(),
          message:    form.message.trim(),
        },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY }
      );
      setStatus('success');
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3500);
    }
  };

  return (
    <>
      <Head>
        <title>GHUBOR</title>
        <meta name="description" content="Ghubor — For those who stopped chasing." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Grain */}
      <canvas ref={grainRef} className="grain" />

      {/* Atmosphere */}
      <div className="void-top" />
      <div className="void-center" />

      {/* Print art panels */}
      <div className="panel left" aria-hidden="true">
        <Image src="/assets/03 Full New.png" alt="" fill sizes="34vw" style={{ objectFit:'cover', objectPosition:'center top' }} draggable={false} />
      </div>
      <div className="panel right" aria-hidden="true">
        <Image src="/assets/05 full.png" alt="" fill sizes="34vw" style={{ objectFit:'cover', objectPosition:'center top' }} draggable={false} />
      </div>
      <div className="panel-strip" aria-hidden="true">
        <Image src="/assets/01 v2 full.png" alt="" fill sizes="18vw" style={{ objectFit:'contain' }} draggable={false} />
      </div>

      {/* Bats */}
      <div className="bat b1" aria-hidden="true">{BAT_SVG}</div>
      <div className="bat b2" aria-hidden="true">{BAT_SVG}</div>

      {/* Nav */}
      <nav>
        <span className="nav-l">SS · 26</span>
        <div className="nav-r">
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="TikTok">TK</a>
          <a href="#" aria-label="Twitter">TT</a>
        </div>
      </nav>

      {/* Main */}
      <main className="page">

        <Image className="logo-img" src="/assets/Ghubor.png" alt="Ghubor" width={600} height={160} priority />
        <p className="brand-line">For those who stopped chasing</p>

        <div className="v-rule" />

        <div className="below">
          <p className="tag">early access</p>

          {status === 'success' ? (
            <p className="success-msg">
              You are in.<br />We will find you when the time comes.
            </p>
          ) : (
            <form className="form-wrap" onSubmit={handleSubmit} noValidate>

              <div className="field-row">
                <div className={`field ${errors.name ? 'err' : ''}`}>
                  <label htmlFor="nm">Name</label>
                  <input
                    id="nm" type="text" placeholder="full name"
                    autoComplete="name" value={form.name}
                    onChange={handleChange('name')}
                  />
                  {errors.name && <span className="field-err">at least 2 characters</span>}
                </div>
                <div className={`field ${errors.phone ? 'err' : ''}`}>
                  <label htmlFor="ph">Phone</label>
                  <input
                    id="ph" type="tel" placeholder="+91 00000 00000"
                    autoComplete="tel" value={form.phone}
                    onChange={handleChange('phone')}
                  />
                  {errors.phone && <span className="field-err">valid phone required</span>}
                </div>
              </div>

              <div className={`field ${errors.email ? 'err' : ''}`}>
                <label htmlFor="em">Email</label>
                <input
                  id="em" type="email" placeholder="you@example.com"
                  autoComplete="email" value={form.email}
                  onChange={handleChange('email')}
                />
                {errors.email && <span className="field-err">valid email required</span>}
              </div>

              <div className={`field ${errors.message ? 'err' : ''}`}>
                <label htmlFor="msg">What are you expecting from us?</label>
                <textarea
                  id="msg" placeholder="tell us what drew you here..."
                  value={form.message} onChange={handleChange('message')}
                />
                {errors.message && <span className="field-err">at least 10 characters</span>}
              </div>

              <div className="sep" />

              <button
                type="submit"
                className="submit-btn"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Request Early Access'}
              </button>

              <p className="form-note">First registrants receive 10% off at launch</p>

              {status === 'error' && (
                <p className="error-msg">Something went wrong. Try again.</p>
              )}

            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="footer-strip">
        <span>© 2026 Ghubor</span>
        <a href="#">Instagram</a>
      </div>

      {/* Marquee */}
      <div className="mq" role="marquee">
        <div className="mq-track">
          <span>
            Register early <em>·</em> Get <em>10% off</em> your first order <em>·</em> Ghubor <em>·</em> SS26 <em>·</em> For those who stopped chasing <em>·</em> Early access only <em>·</em>
          </span>
          <span>
            Register early <em>·</em> Get <em>10% off</em> your first order <em>·</em> Ghubor <em>·</em> SS26 <em>·</em> For those who stopped chasing <em>·</em> Early access only <em>·</em>
          </span>
        </div>
      </div>
    </>
  );
}
