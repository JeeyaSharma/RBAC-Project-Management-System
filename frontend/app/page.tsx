'use client'

import Image from 'next/image'

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>
      {/* Section 1: Hero */}
      <section style={styles.section1} id="section1">
        <div style={styles.section1Header}>
          <Image
            src="/logo.svg"
            alt="SprintOps Logo"
            width={40}
            height={40}
            style={{ width: '40px', height: 'auto' }}
          />
          <span style={styles.sprintOpsText}>SprintOps</span>
        </div>
        <div style={styles.section1Content}>
          <div style={styles.section1Left}>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={styles.cursiveHero}>
                Let's get to <span style={styles.italic}>building.</span>
              </h1>
            </div>
            <p style={styles.section1Text}>Your new project management portal is here.</p>
            <button
              style={styles.learnMoreBtn}
              onClick={() => scrollToSection('section2')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#000'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#000'
              }}
            >
              Learn more
            </button>
          </div>
          <div style={styles.section1Right}>
            <Image
              src="/images/1.svg"
              alt="Project management"
              width={350}
              height={350}
              style={{ width: '100%', height: 'auto', maxWidth: '350px', marginTop: '-30px' }}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Black Background */}
      <section style={styles.section2} id="section2">
        <div style={styles.section2Content}>
          <div style={styles.section2Left}>
            <Image
              src="/images/2.svg"
              alt="Project icons"
              width={300}
              height={300}
              style={{ width: '100%', height: 'auto', maxWidth: '350px', marginTop: '100px' }}
            />
          </div>
          <div style={styles.section2Right}>
            <h2 style={styles.section2Title}>
              Project management doesn't have to be difficult.{' '}
              <span style={styles.italic}>We're here to help.</span>
            </h2>

            <div style={styles.section2Cards}>
              <div>
                <h3 style={styles.section2CardTitle}>Drowning in sprint chaos?</h3>
                <p style={styles.section2CardText}>
                  At SprintOps, we don't just track tasks — we bring structure, control, and clarity
                  to Agile workflows with role-based access.
                </p>
              </div>

              <div>
                <h3 style={styles.section2CardTitle}>Tired of messy team coordination?</h3>
                <p style={styles.section2CardText}>
                  Every project runs differently. That's why SprintOps supports sprint planning,
                  task ownership, and tailored roles.
                </p>
              </div>

              <div>
                <h3 style={styles.section2CardTitle}>Want Agile delivery with accountability built in?</h3>
                <p style={styles.section2CardText}>
                  From backlog to sprint completion, SprintOps keeps every action traceable, every
                  workflow consistent, and every team aligned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Blue Background */}
      <section style={styles.section3}>
        <div style={styles.section3Content}>
          <div style={styles.section3Left}>
            <h2 style={styles.section3Title}>
              Grow your <span style={styles.italic}>presence</span>
            </h2>
            <p style={styles.section3Text}>
              We'll help put your company on the digital map, through websites and social platforms.
            </p>
          </div>
          <div style={styles.section3Right}>
            <Image
              src="/images/3.svg"
              alt="Digital presence"
              width={350}
              height={280}
              style={{ width: '100%', height: 'auto', maxWidth: '350px' }}
            />
          </div>
        </div>
      </section>

      {/* Section 4: What We Offer */}
      <section style={styles.section4}>
        <h2 style={styles.section4Title}>What we offer</h2>
        <div style={styles.section4Grid}>
          <div style={styles.section4Card}>
            <Image
              src="/images/4.svg"
              alt="Data-driven strategies"
              width={180}
              height={180}
              style={{ width: '100%', height: 'auto', maxWidth: '180px', marginBottom: '20px' }}
            />
            <h3 style={styles.section4CardTitle}>Data-driven strategies</h3>
          </div>

          <div style={styles.section4Card}>
            <Image
              src="/images/5.svg"
              alt="Monitoring dashboards"
              width={180}
              height={180}
              style={{ width: '100%', height: 'auto', maxWidth: '180px', marginBottom: '20px' }}
            />
            <h3 style={styles.section4CardTitle}>Monitoring dashboards</h3>
          </div>

          <div style={styles.section4Card}>
            <Image
              src="/images/6.svg"
              alt="Dedicated teams"
              width={180}
              height={180}
              style={{ width: '100%', height: 'auto', maxWidth: '180px', marginBottom: '20px' }}
            />
            <h3 style={styles.section4CardTitle}>Dedicated teams</h3>
          </div>
        </div>
      </section>

      {/* Section 5: Make Your Mark */}
      <section style={styles.section5}>
        <div style={styles.section5Content}>
          <div style={styles.section5Left}>
            <h2 style={styles.section5Title}>
              Make <span style={styles.italic}>your mark</span> in the digital world.
            </h2>
            <button style={styles.workWithUsBtn}>Work with us</button>
          </div>
          <div style={styles.section5Right}>
            <Image
              src="/images/7.svg"
              alt="Digital world"
              width={400}
              height={400}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </section>

      {/* Section 6: Questions */}
      <section style={styles.section6}>
        <div style={styles.section6Content}>
          <div style={styles.section6Left}>
            <Image
              src="/images/8.svg"
              alt="Contact us"
              width={300}
              height={300}
              style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
            />
          </div>
          <div style={styles.section6Right}>
            <h2 style={styles.section6Title}>Questions?</h2>

            <div style={styles.section6ContactBlock}>
              <h3 style={styles.section6ContactTitle}>Phone</h3>
              <p style={styles.section6ContactText}>(123) 456-7890</p>
            </div>

            <div style={styles.section6ContactBlock}>
              <h3 style={styles.section6ContactTitle}>Email</h3>
              <p style={styles.section6ContactText}>hello@reallygreatsite.com</p>
            </div>

            <div style={styles.section6ContactBlock}>
              <h3 style={styles.section6ContactTitle}>Social</h3>
              <p style={styles.section6ContactText}>f x o</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const styles = {
  // Section 1
  section1: {
    backgroundColor: '#edeced',
    padding: '0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
  } as React.CSSProperties,

  section1Header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '30px 40px',
    width: '100%',
  } as React.CSSProperties,

  sprintOpsText: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#000',
  } as React.CSSProperties,

  section1Content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    maxWidth: '1400px',
    width: '100%',
    alignItems: 'center',
    padding: '80px 40px',
    flex: 1,
  } as React.CSSProperties,

  section1Left: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  } as React.CSSProperties,

  section1Right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  cursiveHero: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '4.5rem',
    fontWeight: '400',
    margin: '0',
    color: '#000',
    lineHeight: '1.2',
  } as React.CSSProperties,

  italic: {
    fontStyle: 'italic',
  } as React.CSSProperties,

  section1Text: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1.2rem',
    margin: '20px 0 0 0',
    color: '#000',
  } as React.CSSProperties,

  learnMoreBtn: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '12px 40px',
    fontSize: '1rem',
    border: '2px solid #000',
    backgroundColor: 'transparent',
    color: '#000',
    borderRadius: '30px',
    cursor: 'pointer',
    width: 'fit-content',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  // Section 2
  section2: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '80px 40px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section2Content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    maxWidth: '1400px',
    width: '100%',
    alignItems: 'flex-start',
  } as React.CSSProperties,

  section2Left: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section2Right: {
    paddingTop: '40px',
  } as React.CSSProperties,

  section2Title: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '3.5rem',
    fontWeight: '400',
    margin: '0 0 60px 0',
    color: '#fff',
    lineHeight: '1.2',
  } as React.CSSProperties,

  section2Cards: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '40px',
  } as React.CSSProperties,

  section2CardTitle: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#fff',
  } as React.CSSProperties,

  section2CardText: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1rem',
    margin: '0',
    color: '#ddd',
    lineHeight: '1.6',
  } as React.CSSProperties,

  // Section 3
  section3: {
    backgroundColor: '#006eef',
    color: '#fff',
    padding: '80px 40px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section3Content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    maxWidth: '1400px',
    width: '100%',
    alignItems: 'center',
  } as React.CSSProperties,

  section3Left: {
    paddingRight: '40px',
  } as React.CSSProperties,

  section3Right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section3Title: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '4rem',
    fontWeight: '400',
    margin: '0 0 30px 0',
    color: '#fff',
    lineHeight: '1.2',
  } as React.CSSProperties,

  section3Text: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1.2rem',
    margin: '0',
    color: '#fff',
    lineHeight: '1.6',
  } as React.CSSProperties,

  // Section 4
  section4: {
    backgroundColor: '#feffff',
    padding: '80px 40px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section4Title: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '3.5rem',
    fontWeight: '400',
    margin: '0 0 80px 0',
    color: '#000',
    textAlign: 'center',
  } as React.CSSProperties,

  section4Grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
    maxWidth: '1200px',
    width: '100%',
  } as React.CSSProperties,

  section4Card: {
    backgroundColor: '#fff',
    borderRadius: '25px',
    padding: '50px 40px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as React.CSSProperties,

  section4CardTitle: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#000',
    margin: '0',
  } as React.CSSProperties,

  // Section 5
  section5: {
    backgroundColor: '#edeced',
    padding: '80px 40px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section5Content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    maxWidth: '1400px',
    width: '100%',
    alignItems: 'center',
  } as React.CSSProperties,

  section5Left: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  } as React.CSSProperties,

  section5Right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section5Title: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '4rem',
    fontWeight: '400',
    margin: '0',
    color: '#000',
    lineHeight: '1.2',
  } as React.CSSProperties,

  workWithUsBtn: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    padding: '12px 40px',
    fontSize: '1rem',
    border: '2px solid #000',
    backgroundColor: 'transparent',
    color: '#000',
    borderRadius: '30px',
    cursor: 'pointer',
    width: 'fit-content',
    fontWeight: 'bold',
  } as React.CSSProperties,

  // Section 6
  section6: {
    backgroundColor: '#006eef',
    color: '#fff',
    padding: '80px 40px',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section6Content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    maxWidth: '1400px',
    width: '100%',
    alignItems: 'center',
  } as React.CSSProperties,

  section6Left: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  section6Right: {
    paddingLeft: '40px',
  } as React.CSSProperties,

  section6Title: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '4rem',
    fontWeight: '400',
    margin: '0 0 60px 0',
    color: '#fff',
    fontStyle: 'italic',
  } as React.CSSProperties,

  section6ContactBlock: {
    marginBottom: '40px',
  } as React.CSSProperties,

  section6ContactTitle: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#fff',
  } as React.CSSProperties,

  section6ContactText: {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '1rem',
    margin: '0',
    color: '#fff',
  } as React.CSSProperties,
}
