
export default function DashboardPage() {
	return (
		<main style={{ padding: '60px 40px', backgroundColor: 'var(--section4-bg)', minHeight: '100vh' }}>
			<h1
				style={{
					fontFamily: '"Times New Roman", Times, serif',
					fontSize: '3rem',
					margin: 0,
					color: 'var(--section4-text)',
				}}
			>
				Dashboard
			</h1>
			<p
				style={{
					fontFamily: 'Helvetica, Arial, sans-serif',
					fontSize: '1rem',
					marginTop: '16px',
					color: 'var(--section4-text)',
				}}
			>
				This is your dashboard. Add widgets and stats here.
			</p>
		</main>
	)
}
