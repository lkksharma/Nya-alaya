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
	MoreHorizontal,
	Brain,
	Clock
} from "lucide-react";
import { casesAPI, schedulesAPI, judgesAPI } from "../services/api";
import SearchBar from "../components/SearchBar";
import "./Cases.css";

const Cases = () => {
	const [cases, setCases] = useState([]);
	const [schedules, setSchedules] = useState([]);
	const [judges, setJudges] = useState([]);
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
		fetchJudges();
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

	const fetchJudges = async () => {
		try {
			const response = await judgesAPI.getAll();
			setJudges(response.data);
		} catch (error) {
			console.error("Error fetching judges:", error);
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
			alert("Error saving case. Please check the form data.");
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
			description: caseItem.description || "", // Ensure description is handled
			filed_in: caseItem.filed_in,
		});
		setShowModal(true);
	};

	const resetForm = () => {
		setSelectedCase(null);
		setFormData({
			case_number: "",
			case_type: "civil",
			description: "",
			filed_in: "",
		});
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
			<header className="page-header">
				<div>
					<motion.h1
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
					>
						Cases
					</motion.h1>
					<p className="text-secondary">Manage and track all legal cases</p>
				</div>
				<button
					className="btn btn-primary"
					onClick={() => {
						resetForm();
						setShowModal(true);
					}}
				>
					<Plus size={18} />
					<span>New Case</span>
				</button>
			</header>

			<motion.div 
				className="toolbar-container"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
			>
				<SearchBar 
					value={searchTerm}
					onChange={setSearchTerm}
					onClear={() => setSearchTerm("")}
					placeholder="Search cases by number..."
					filterOptions={[
						{ value: "all", label: "All Types" },
						{ value: "civil", label: "Civil" },
						{ value: "criminal", label: "Criminal" },
						{ value: "family", label: "Family" },
						{ value: "other", label: "Other" }
					]}
					selectedFilter={filterType}
					onFilterChange={setFilterType}
				/>
			</motion.div>

			<div className="cases-list">
				{loading ? (
					<div className="loading-state">
						<div className="spinner"></div>
						<p>Loading cases...</p>
					</div>
				) : filteredCases.length === 0 ? (
					<div className="empty-state">
						<FileText size={48} className="text-tertiary" />
						<h3>No cases found</h3>
						<p>Try adjusting your filters or add a new case.</p>
					</div>
				) : (
					<div className="cases-grid">
						{filteredCases.map((caseItem, index) => (
							<motion.div
								key={caseItem.id}
								className="case-card glass-panel"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								whileHover={{ y: -4 }}
							>
								<div className="case-header">
									<div className="case-id">
										<FileText size={16} />
										<span>{caseItem.case_number}</span>
									</div>
									<div className="case-actions-menu">
										<button onClick={() => handleEdit(caseItem)}>
											<Edit size={16} />
										</button>
										<button onClick={() => handleDelete(caseItem.id)} className="danger">
											<Trash2 size={16} />
										</button>
									</div>
								</div>
								
								<div className="case-body">
									<div className="case-meta">
										<span className={`badge type-${caseItem.case_type}`}>
											{caseItem.case_type}
										</span>
										<span className="urgency-indicator">
											<TrendingUp size={14} />
											{(caseItem.urgency * 100).toFixed(0)}% Urgency
										</span>
									</div>
									<p className="case-description-preview">
										{caseItem.description || "No description provided."}
									</p>
								</div>

								<div className="case-footer">
									<div className="footer-item">
										<Calendar size={14} />
										<span>{new Date(caseItem.filed_in).toLocaleDateString()}</span>
									</div>
									<div className="footer-item">
										<Clock size={14} />
										<span>{caseItem.estimated_duration} min</span>
									</div>
									{caseItem.assigned_judge && (
										<div className="footer-item judge-assignment">
											<FileText size={14} />
											<span>{judges.find(j => j.id === caseItem.assigned_judge)?.name || 'Judge assigned'}</span>
										</div>
									)}
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>

			<AnimatePresence>
				{showModal && (
					<div className="modal-backdrop" onClick={() => setShowModal(false)}>
						<motion.div
							className="modal-container glass-panel"
							onClick={(e) => e.stopPropagation()}
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
						>
							<div className="modal-header">
								<h2>{selectedCase ? "Edit Case" : "New Case"}</h2>
								<button onClick={() => setShowModal(false)}>
									<X size={20} />
								</button>
							</div>

							{isAnalyzing && (
								<div className="ai-overlay">
									<motion.div 
										className="ai-icon"
										animate={{ rotate: 360, scale: [1, 1.1, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
									>
										<Brain size={48} />
									</motion.div>
									<h3>AI Analysis in Progress</h3>
									<p>Analyzing case details to determine urgency and duration...</p>
								</div>
							)}

							<form onSubmit={handleSubmit} className="modal-form">
								<div className="form-row">
									<div className="form-group">
										<label>Case Number</label>
										<input
											type="text"
											required
											value={formData.case_number}
											onChange={(e) => setFormData({...formData, case_number: e.target.value})}
											placeholder="e.g., CIV/2025/001"
										/>
									</div>
									<div className="form-group">
										<label>Type</label>
										<select
											value={formData.case_type}
											onChange={(e) => setFormData({...formData, case_type: e.target.value})}
										>
											<option value="civil">Civil</option>
											<option value="criminal">Criminal</option>
											<option value="family">Family</option>
											<option value="other">Other</option>
										</select>
									</div>
								</div>

								<div className="form-group">
									<label>Filed Date</label>
									<input
										type="date"
										required
										value={formData.filed_in}
										onChange={(e) => setFormData({...formData, filed_in: e.target.value})}
									/>
								</div>

								<div className="form-group">
									<label>Description</label>
									<textarea
										required
										rows="4"
										value={formData.description}
										onChange={(e) => setFormData({...formData, description: e.target.value})}
										placeholder="Describe the case details..."
									/>
									<small className="hint">
										<Brain size={12} />
										AI will analyze this description to set priority and urgency.
									</small>
								</div>

								<div className="modal-actions">
									<button type="button" className="btn btn-text" onClick={() => setShowModal(false)}>
										Cancel
									</button>
									<button type="submit" className="btn btn-primary" disabled={isAnalyzing}>
										{selectedCase ? "Update Case" : "Create & Analyze"}
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Cases;
