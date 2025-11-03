import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Scale,
	Plus,
	Search,
	X,
	Calendar,
	MapPin,
	Clock,
	FileText,
	Eye,
	Edit,
	Trash2,
} from "lucide-react";
import { judgesAPI, schedulesAPI, casesAPI } from "../services/api";
import "./Judges.css";

const Judges = () => {
	const [judges, setJudges] = useState([]);
	const [schedules, setSchedules] = useState([]);
	const [cases, setCases] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [selectedJudge, setSelectedJudge] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [formData, setFormData] = useState({
		name: "",
		court: "",
		availability: [],
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [judgesRes, schedulesRes, casesRes] = await Promise.all([
				judgesAPI.getAll(),
				schedulesAPI.getAll(),
				casesAPI.getAll(),
			]);
			setJudges(judgesRes.data);
			setSchedules(schedulesRes.data);
			setCases(casesRes.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (selectedJudge) {
				await judgesAPI.update(selectedJudge.id, formData);
			} else {
				await judgesAPI.create(formData);
			}
			setShowModal(false);
			resetForm();
			fetchData();
		} catch (error) {
			console.error("Error saving judge:", error);
			alert("Error saving judge. Please check the form data.");
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this judge?")) {
			try {
				await judgesAPI.delete(id);
				fetchData();
			} catch (error) {
				console.error("Error deleting judge:", error);
			}
		}
	};

	const handleEdit = (judge) => {
		setSelectedJudge(judge);
		setFormData({
			name: judge.name,
			court: judge.court,
			availability: judge.availability || [],
		});
		setShowModal(true);
	};

	const resetForm = () => {
		setSelectedJudge(null);
		setFormData({
			name: "",
			court: "",
			availability: [],
		});
	};

	const getJudgeSchedules = (judgeId) => {
		return schedules.filter((s) => s.judge === judgeId);
	};

	const getCaseById = (caseId) => {
		return cases.find((c) => c.id === caseId);
	};

	const viewJudgeSchedule = (judge) => {
		setSelectedJudge(judge);
		setShowScheduleModal(true);
	};

	const filteredJudges = judges.filter(
		(j) =>
			j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			j.court.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="judges-page">
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
						<Scale size={32} />
						<h1 className="page-title">
							<div
								style={{
									paddingLeft: "10px",
									paddingTop: "7px",
								}}
							>
								Judges Management
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
					Add New Judge
				</button>
			</motion.div>

			{/* Search */}
			<motion.div
				className="search-section"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.1 }}
			>
				<div className="search-box">
					<Search size={20} />
					<input
						type="text"
						placeholder="Search by judge name or court..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</motion.div>

			{/* Judges Grid */}
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
						<Scale size={48} />
					</motion.div>
					<p>Loading judges...</p>
				</div>
			) : (
				<div className="judges-grid">
					{filteredJudges.map((judge, index) => {
						const judgeSchedules = getJudgeSchedules(judge.id);
						return (
							<motion.div
								key={judge.id}
								className="judge-card"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								whileHover={{ y: -5 }}
							>
								<div className="judge-card-header">
									<div className="judge-avatar">
										<Scale size={32} />
									</div>
									<div className="judge-actions">
										<button
											className="icon-btn"
											onClick={() => handleEdit(judge)}
											title="Edit"
										>
											<Edit size={16} />
										</button>
										<button
											className="icon-btn delete"
											onClick={() =>
												handleDelete(judge.id)
											}
											title="Delete"
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>

								<div className="judge-info">
									<h3 className="judge-name">{judge.name}</h3>
									<div className="judge-detail">
										<MapPin size={16} />
										<span>{judge.court}</span>
									</div>
								</div>

								<div className="judge-stats">
									<div className="stat">
										<Calendar size={18} />
										<div>
											<span className="stat-value">
												{judgeSchedules.length}
											</span>
											<span className="stat-label">
												Scheduled Cases
											</span>
										</div>
									</div>
								</div>

								<button
									className="btn-view-schedule"
									onClick={() => viewJudgeSchedule(judge)}
								>
									<Eye size={18} />
									View Schedule
								</button>
							</motion.div>
						);
					})}

					{filteredJudges.length === 0 && (
						<div className="empty-state-full">
							<Scale size={64} />
							<h3>No judges found</h3>
							<p>
								{searchTerm
									? "Try adjusting your search"
									: 'Click "Add New Judge" to register a judge'}
							</p>
						</div>
					)}
				</div>
			)}

			{/* Add/Edit Judge Modal */}
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
									{selectedJudge
										? "Edit Judge"
										: "Add New Judge"}
								</h2>
								<button
									className="close-btn"
									onClick={() => setShowModal(false)}
								>
									<X size={24} />
								</button>
							</div>

							<form
								onSubmit={handleSubmit}
								className="judge-form"
							>
								<div className="form-group">
									<label htmlFor="name">Judge Name *</label>
									<input
										id="name"
										type="text"
										required
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										placeholder="e.g., Justice Ramesh Kumar"
									/>
								</div>

								<div className="form-group">
									<label htmlFor="court">Court *</label>
									<input
										id="court"
										type="text"
										required
										value={formData.court}
										onChange={(e) =>
											setFormData({
												...formData,
												court: e.target.value,
											})
										}
										placeholder="e.g., Delhi High Court"
									/>
								</div>

								<div className="form-actions">
									<button
										type="button"
										className="btn-secondary"
										onClick={() => setShowModal(false)}
									>
										Cancel
									</button>
									<button
										type="submit"
										className="btn-primary"
									>
										{selectedJudge
											? "Update Judge"
											: "Add Judge"}
									</button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* View Schedule Modal */}
			<AnimatePresence>
				{showScheduleModal && selectedJudge && (
					<motion.div
						className="modal-overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setShowScheduleModal(false)}
					>
						<motion.div
							className="modal-content schedule-modal"
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="modal-header">
								<h2>{selectedJudge.name}'s Schedule</h2>
								<button
									className="close-btn"
									onClick={() => setShowScheduleModal(false)}
								>
									<X size={24} />
								</button>
							</div>

							<div className="schedule-content">
								{getJudgeSchedules(selectedJudge.id).length ===
								0 ? (
									<div className="empty-state">
										<Calendar size={48} />
										<p>No scheduled cases</p>
									</div>
								) : (
									<div className="schedule-list">
										{getJudgeSchedules(
											selectedJudge.id
										).map((schedule, idx) => {
											const caseItem = getCaseById(
												schedule.case
											);
											return (
												<motion.div
													key={schedule.id}
													className="schedule-card"
													initial={{
														opacity: 0,
														x: -20,
													}}
													animate={{
														opacity: 1,
														x: 0,
													}}
													transition={{
														delay: idx * 0.05,
													}}
												>
													<div className="schedule-header">
														<FileText size={20} />
														<div>
															<h4>
																{caseItem?.case_number ||
																	`Case #${schedule.case}`}
															</h4>
															{caseItem && (
																<span
																	className={`case-type-badge type-${caseItem.case_type}`}
																>
																	{
																		caseItem.case_type
																	}
																</span>
															)}
														</div>
													</div>
													<div className="schedule-details">
														<div className="detail">
															<Clock size={16} />
															<span>
																{new Date(
																	schedule.start_time
																).toLocaleString(
																	"en-IN",
																	{
																		dateStyle:
																			"medium",
																		timeStyle:
																			"short",
																	}
																)}
															</span>
														</div>
														<div className="detail">
															<MapPin size={16} />
															<span>
																{schedule.room ||
																	"Courtroom 1"}
															</span>
														</div>
													</div>
												</motion.div>
											);
										})}
									</div>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Judges;
