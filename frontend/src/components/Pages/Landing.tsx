import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const features = [
	{
		icon: "💪",
		title: "Personalized Workouts",
		desc: "Get routines tailored to your goals and progress.",
	},
	{
		icon: "📊",
		title: "Progress Analytics",
		desc: "Visualize your improvements with beautiful charts.",
	},
	{
		icon: "🤖",
		title: "AI Coaching",
		desc: "Receive smart tips and feedback from your AI coach.",
	},
	{
		icon: "🎯",
		title: "Goal Tracking",
		desc: "Set, track, and achieve your fitness milestones.",
	},
];

const Landing: React.FC = () => {
	const navigate = useNavigate();
	const [hovered, setHovered] = useState<number | null>(null);

	const handleGetStarted = () => {
		navigate("/login");
	};

	return (
		<div
			className="landing-bg"
			style={{
				background:
					"radial-gradient(ellipse at 60% 20%, #38bdf822 0%, transparent 60%), linear-gradient(120deg, #23283a 60%, #181c24 100%)",
				minHeight: "100dvh",
				width: "100%",
				overflow: "unset",
			}}
		>
			<div className="landing-hero" style={{ marginTop: "2.5rem" }}>
				{/* Hero Illustration/Accent */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
					}}
				>
					<svg
						width="92"
						height="92"
						viewBox="0 0 92 92"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{ marginBottom: "1.5rem" }}
					>
						<circle
							cx="46"
							cy="46"
							r="46"
							fill="url(#paint0_linear)"
						/>
						<path
							d="M46 25C38.268 25 32 31.268 32 39C32 46.732 38.268 53 46 53C53.732 53 60 46.732 60 39C60 31.268 53.732 25 46 25ZM46 49C40.477 49 36 44.523 36 39C36 33.477 40.477 29 46 29C51.523 29 56 33.477 56 39C56 44.523 51.523 49 46 49Z"
							fill="#fff"
							fillOpacity="0.9"
						/>
						<rect
							x="41"
							y="56"
							width="10"
							height="20"
							rx="5"
							fill="#38bdf8"
						/>
						<defs>
							<linearGradient
								id="paint0_linear"
								x1="0"
								y1="0"
								x2="92"
								y2="92"
								gradientUnits="userSpaceOnUse"
							>
								<stop stopColor="#38bdf8" />
								<stop offset="1" stopColor="#2563eb" />
							</linearGradient>
						</defs>
					</svg>
					<div
						className="landing-content"
						style={{
							background: "none",
							boxShadow: "none",
							padding: 0,
							gap: "2.5rem",
						}}
					>
						<h1
							className="landing-title"
							style={{
								fontSize: "2.8rem",
								marginBottom: "0.5rem",
							}}
						>
							Smarter Workouts, Better You
						</h1>
						<div
							className="landing-subtitle"
							style={{
								fontSize: "1.25rem",
								marginBottom: "2.2rem",
							}}
						>
							Unlock your fitness journey with AI-powered insights,
							personalized plans, and beautiful analytics.
							<br />
							<span
								style={{
									color: "#38bdf8",
									fontWeight: 700,
								}}
							>
								All in one modern dashboard.
							</span>
						</div>
						<div
							style={{
								color: "#e0e7ef",
								fontSize: "1.08rem",
								marginBottom: "1.2rem",
								opacity: 0.92,
							}}
						>
							Log in to access your personalized dashboard and start
							your transformation!
						</div>
						<button
							className="landing-get-started"
							onClick={handleGetStarted}
						>
							Get Started
						</button>
					</div>
				</div>
			</div>
			{/* Features Section */}
			<div
				style={{
					width: "100%",
					maxWidth: 900,
					margin: "2.5rem auto 0 auto",
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "center",
					gap: "2.2rem",
					padding: "0 1rem",
				}}
			>
				{features.map((f, i) => (
					<div
						key={f.title}
						onMouseEnter={() => setHovered(i)}
						onMouseLeave={() => setHovered(null)}
						style={{
							background: "rgba(36,42,58,0.93)",
							borderRadius: "1.2rem",
							boxShadow:
								hovered === i
									? "0 4px 32px #38bdf888, 0 2px 16px #23283a55"
									: "0 2px 16px #23283a33",
							padding: "1.5rem 1.3rem",
							minWidth: 210,
							maxWidth: 260,
							flex: "1 1 210px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							textAlign: "center",
							color: "#e0e7ef",
							border:
								hovered === i
									? "2px solid #38bdf8"
									: "1.5px solid #23283a",
							transition:
								"box-shadow 0.22s, border 0.22s, transform 0.18s",
							fontSize: "1rem",
							fontWeight: 500,
							transform: hovered === i ? "scale(1.045)" : "scale(1)",
							cursor: "pointer",
						}}
					>
						<div
							style={{
								fontSize: "2.1rem",
								marginBottom: "0.7rem",
							}}
						>
							{f.icon}
						</div>
						<div
							style={{
								fontWeight: 700,
								color: "#38bdf8",
								fontSize: "1.13rem",
								marginBottom: "0.3rem",
							}}
						>
							{f.title}
						</div>
						<div style={{ opacity: 0.88 }}>{f.desc}</div>
					</div>
				))}
			</div>
			<footer className="landing-footer">
				&copy; {new Date().getFullYear()} SmartWorkout. All rights
				reserved.
			</footer>
		</div>
	);
};

export default Landing;
