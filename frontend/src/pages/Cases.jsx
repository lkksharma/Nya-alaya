import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileText,
	Plus,
	Search,
	Filter,
	X,
	Calendar,
	TrendingUp,
	Edit,
	Trash2,
	Eye,
} from "lucide-react";
import { casesAPI, schedulesAPI } from "../services/api";
import "./Cases.css";

const Cases = () => {
	const [cases, setCases] = useState([]);
	const [schedules, setSchedules] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");
	const [selectedCase, setSelectedCase] = useState(null);
	const [formData, setFormData] = useState({
		case_number: "",
		case_type: "civil",
		description: "",
		filed_in: "",
	});

	useEffect(() => {
		fetchCases();
		fetchSchedules();
	}, []);

	const fetchCases = async () => {
		try {
			setLoading(true);
			const response = await casesAPI.getAll();
			setCases(response.data);
		} catch (error) {
			console.error("Error fetching cases:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchSchedules = async () => {
		try {
			const response = await schedulesAPI.getAll();
			setSchedules(response.data);
		} catch (error) {
			console.error("Error fetching schedules:", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const dataToSend = {
			case_number: formData.case_number.trim(),
			case_type: formData.case_type,
			description: formData.description.trim(),
			filed_in: formData.filed_in,
		};

		console.log("📤 Sending case data:", dataToSend);

		try {
			setIsAnalyzing(true);

			if (selectedCase) {
				await casesAPI.update(selectedCase.id, dataToSend);
			} else {
				await casesAPI.create(dataToSend);
			}

			setShowModal(false);
			resetForm();
			await fetchCases();
		} catch (error) {
			console.error("Error saving case:", error);
			console.error("Error response:", error.response?.data);

			const errorMessage = error.response?.data
				? JSON.stringify(error.response.data, null, 2)
				: "Please check the form data.";

			alert(`Error saving case:\n${errorMessage}`);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this case?")) {
			try {
				await casesAPI.delete(id);
				fetchCases();
			} catch (error) {
				console.error("Error deleting case:", error);
			}
		}
	};

	const handleEdit = (caseItem) => {
		setSelectedCase(caseItem);
		setFormData({
			case_number: caseItem.case_number,
			case_type: caseItem.case_type,
			filed_in: caseItem.filed_in,
			urgency: caseItem.urgency,
			estimated_duration: caseItem.estimated_duration,
		});
		setShowModal(true);
	};

	const resetForm = () => {
		setSelectedCase(null);
		setFormData({
			case_number: "",
			case_type: "civil",
			filed_in: "",
			urgency: 0.5,
			estimated_duration: 60,
		});
	};

	const getCaseSchedule = (caseId) => {
		return schedules.find((s) => s.case === caseId);
	};

	const filteredCases = cases.filter((c) => {
		const matchesSearch = c.case_number
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesFilter =
			filterType === "all" || c.case_type === filterType;
		return matchesSearch && matchesFilter;
	});

	return (
		<div className="cases-page">
			{/* Page Header */}
			<motion.div
				className="page-header"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<div
					className="upperBar"
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexDirection: "column",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexDirection: "row",
						}}
					>
						<FileText size={32} />
						<h1 className="page-title">
							<div
								style={{
									paddingLeft: "10px",
									paddingTop: "7px",
								}}
							>
								Case Management
							</div>
						</h1>
					</div>
					<div>
						<p className="page-subtitle">
							Manage judges and view their schedules
						</p>
					</div>
				</div>

				<button
					className="btn-primary"
					onClick={() => {
						resetForm();
						setShowModal(true);
					}}
				>
					<Plus size={18} />
					Add New Case
				</button>
			</motion.div>

			{/* Filters */}
			<motion.div
				className="filters-section"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.1 }}
			>
				<div className="search-box">
					<Search size={20} />
					<input
						type="text"
						placeholder="Search by case number..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className="filter-group">
					<Filter size={18} />
					<select
						value={filterType}
						onChange={(e) => setFilterType(e.target.value)}
						className="filter-select"
					>
						<option value="all">All Types</option>
						<option value="civil">Civil</option>
						<option value="criminal">Criminal</option>
						<option value="family">Family</option>
						<option value="other">Other</option>
					</select>
				</div>
			</motion.div>

			{/* Cases Grid */}
			{loading ? (
				<div className="loading-container">
					<motion.div
						className="loader"
						animate={{ rotate: 360 }}
						transition={{
							duration: 1,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						<FileText size={48} />
					</motion.div>
					<p>Loading cases...</p>
				</div>
			) : (
				<div className="cases-grid">
					{filteredCases.map((caseItem, index) => {
						const schedule = getCaseSchedule(caseItem.id);
						return (
							<motion.div
								key={caseItem.id}
								className="case-card"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								whileHover={{ y: -5 }}
							>
								<div className="case-card-header">
									<div>
										<h3 className="case-title">
											{caseItem.case_number}
										</h3>
										<span
											className={`case-badge type-${caseItem.case_type}`}
										>
											{caseItem.case_type}
										</span>
									</div>
									<div className="case-actions">
										<button
											className="icon-btn"
											onClick={() => handleEdit(caseItem)}
											title="Edit"
										>
											<Edit size={16} />
										</button>
										<button
											className="icon-btn delete"
											onClick={() =>
												handleDelete(caseItem.id)
											}
											title="Delete"
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>

								<div className="case-card-body">
									<div className="case-detail">
										<Calendar size={16} />
										<span>
											Filed:{" "}
											{new Date(
												caseItem.filed_in
											).toLocaleDateString("en-IN")}
										</span>
									</div>

									<div className="case-detail">
										<TrendingUp size={16} />
										<span>
											Urgency:{" "}
											{(caseItem.urgency * 100).toFixed(
												0
											)}
											%
										</span>
									</div>

									<div className="case-metrics">
										<div className="metric">
											<span className="metric-label">
												Duration
											</span>
											<span className="metric-value">
												{caseItem.estimated_duration}{" "}
												min
											</span>
										</div>
										<div className="metric">
											<span className="metric-label">
												Priority
											</span>
											<span className="metric-value">
												{(
													caseItem.priority || 0
												).toFixed(2)}
											</span>
										</div>
									</div>

									{schedule && (
										<div className="schedule-info-box">
											<Eye size={14} />
											<span>
												Scheduled:{" "}
												{new Date(
													schedule.start_time
												).toLocaleDateString(
													"en-IN"
												)}{" "}
												at{" "}
												{new Date(
													schedule.start_time
												).toLocaleTimeString("en-IN", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									)}
								</div>
							</motion.div>
						);
					})}

					{filteredCases.length === 0 && (
						<div className="empty-state-full">
							<FileText size={64} />
							<h3>No cases found</h3>
							<p>
								{searchTerm || filterType !== "all"
									? "Try adjusting your search or filters"
									: 'Click "Add New Case" to create your first case'}
							</p>
						</div>
					)}
				</div>
			)}

			{/* Add/Edit Modal */}
			<AnimatePresence>
				{showModal && (
					<motion.div
						className="modal-overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setShowModal(false)}
					>
						<motion.div
							className="modal-content"
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="modal-header">
								<h2>
									{selectedCase
										? "Edit Case"
										: "Add New Case"}
								</h2>
								<button
									className="close-btn"
									onClick={() => setShowModal(false)}
									disabled={isAnalyzing}
								>
									<X size={24} />
								</button>
							</div>

							{/* AI Analysis Loading Overlay */}
							{isAnalyzing && (
								<div className="ai-analysis-overlay">
									<div className="ai-analysis-content">
										<motion.div
											className="ai-brain-icon"
											animate={{
												scale: [1, 1.2, 1],
												rotate: [0, 5, -5, 0],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: "easeInOut",
											}}
										>
											🧠
										</motion.div>
										<h3>AI Analysis in Progress</h3>
										<p>
											Our AI is analyzing your case
											description to determine:
										</p>
										<ul>
											<li>Case urgency level</li>
											<li>Estimated hearing duration</li>
											<li>Priority for scheduling</li>
										</ul>
										<motion.div
											className="loading-dots"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
										>
											<motion.span
												animate={{
													opacity: [0.3, 1, 0.3],
												}}
												transition={{
													duration: 1.5,
													repeat: Infinity,
													delay: 0,
												}}
											>
												●
											</motion.span>
											<motion.span
												animate={{
													opacity: [0.3, 1, 0.3],
												}}
												transition={{
													duration: 1.5,
													repeat: Infinity,
													delay: 0.2,
												}}
											>
												●
											</motion.span>
											<motion.span
												animate={{
													opacity: [0.3, 1, 0.3],
												}}
												transition={{
													duration: 1.5,
													repeat: Infinity,
													delay: 0.4,
												}}
											>
												●
											</motion.span>
										</motion.div>
									</div>
								</div>
							)}

							<form onSubmit={handleSubmit} className="case-form">
								<div className="form-group">
									<label htmlFor="case_number">
										Case Number *
									</label>
									<input
										id="case_number"
										type="text"
										required
										value={formData.case_number}
										onChange={(e) =>
											setFormData({
												...formData,
												case_number: e.target.value,
											})
										}
										placeholder="e.g., CIV/2025/001"
									/>
								</div>

								<div className="form-group">
									<label htmlFor="case_type">
										Case Type *
									</label>
									<select
										id="case_type"
										required
										value={formData.case_type}
										onChange={(e) =>
											setFormData({
												...formData,
												case_type: e.target.value,
											})
										}
									>
										<option value="civil">Civil</option>
										<option value="criminal">
											Criminal
										</option>
										<option value="family">Family</option>
										<option value="other">Other</option>
									</select>
								</div>

								{/* NEW: Case Description */}
								<div className="form-group">
									<label htmlFor="description">
										Case Description *
									</label>
									<textarea
										id="description"
										required
										rows="5"
										value={formData.description}
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										placeholder="Describe the case details, parties involved, nature of dispute, evidence, etc. Our AI will analyze this to determine urgency and duration."
										style={{
											width: "100%",
											padding: "0.75rem 1rem",
											border: "1px solid var(--border)",
											borderRadius: "8px",
											fontSize: "0.95rem",
											fontFamily: "inherit",
											resize: "vertical",
										}}
									/>
									<small
										style={{
											color: "var(--text-secondary)",
											fontSize: "0.85rem",
										}}
									>
										💡 Tip: Include details about urgency,
										complexity, and expected witnesses for
										better AI analysis
									</small>
								</div>

								<div className="form-group">
									<label htmlFor="filed_in">
										Filed Date *
									</label>
									<input
										id="filed_in"
										type="date"
										required
										value={formData.filed_in}
										onChange={(e) => {
											console.log(
												"Date selected:",
												e.target.value
											);
											setFormData({
												...formData,
												filed_in: e.target.value,
											});
										}}
									/>
								</div>

								<div
									className="info-box"
									style={{
										background: "rgba(26, 77, 143, 0.05)",
										border: "1px solid rgba(26, 77, 143, 0.2)",
										borderRadius: "8px",
										padding: "1rem",
										marginBottom: "1.5rem",
									}}
								>
									<p
										style={{
											margin: 0,
											fontSize: "0.9rem",
										}}
									>
										🤖 <strong>AI-Powered Analysis:</strong>{" "}
										Based on your description, our AI will
										automatically calculate:
									</p>
									<ul
										style={{
											marginTop: "0.5rem",
											marginBottom: 0,
											paddingLeft: "1.5rem",
										}}
									>
										<li>
											Urgency level (considering safety,
											time-sensitivity)
										</li>
										<li>Estimated hearing duration</li>
										<li>Case priority for scheduling</li>
									</ul>
								</div>

								<div className="form-actions">
									<button
										type="button"
										className="btn-secondary"
										onClick={() => setShowModal(false)}
										disabled={isAnalyzing}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="btn-primary"
										disabled={isAnalyzing}
									>
										{isAnalyzing ? (
											<>
												<motion.div
													className="loading-spinner"
													animate={{ rotate: 360 }}
													transition={{
														duration: 1,
														repeat: Infinity,
														ease: "linear",
													}}
												>
													⚡
												</motion.div>
												Analyzing...
											</>
										) : selectedCase ? (
											"Update Case"
										) : (
											"Create Case with AI Analysis"
										)}
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Cases;
