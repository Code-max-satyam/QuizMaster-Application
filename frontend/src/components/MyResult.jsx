import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { resultStyles } from '../assets/dummyStyles'
import axios from 'axios';
import { toast } from 'react-toastify';

const Badge = ({ percent }) => {
    if (percent >= 85)
        return <span className={resultStyles.badgeExcellent}>Excellent</span>;
    if (percent >= 65)
        return <span className={resultStyles.badgeGood}>Good</span>;
    if (percent >= 45)
        return <span className={resultStyles.badgeAverage}>Average</span>;
    return <span className={resultStyles.badgeNeedsWork}>Needs Work</span>;
};

const MyResult = ({ apiBase = "http://localhost:4000" }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTechnology, setSelectedTechnology] = useState("all");  // for filter
    const [technologies, setTechnologies] = useState([]);

    // token for user verification
    const getAuthHeader = useCallback(() => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("authToken") ||
            null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    // Effect: Fetch results when component mounts or when selectedTechnology changes
    useEffect(() => {
        let mounted = true;
        const fetchResults = async (tech = "all") => {
            setLoading(true);
            setError(null);
            try {
                const q =
                    tech && tech.toLowerCase() !== "all"
                        ? `?technology=${encodeURIComponent(tech)}`
                        : "";
                const res = await axios.get(`${apiBase}/api/results${q}`, {
                    headers: { "Content-Type": "application/json", ...getAuthHeader() },
                    timeout: 10000,
                });
                if (!mounted) return;
                if (res.status === 200 && res.data && res.data.success) {
                    setResults(Array.isArray(res.data.results) ? res.data.results : []);
                } else {
                    setResults([]);
                    toast.warn("Unexpected server response while fetching results.");
                }
            } catch (err) {
                console.error(
                    "Failed to fetch results:",
                    err?.response?.data || err.message || err
                );
                if (!mounted) return;
                if (err?.response?.status === 401) {
                    setError("Not authenticated. Please log in to view results.");
                    toast.error("Not authenticated. Please login.");
                } else {
                    setError("Could not load results from server.");
                    toast.error("Could not load results from server.");
                    setResults([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchResults(selectedTechnology);
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase, selectedTechnology, getAuthHeader]);


    // Effect: fetch all results once (or when apiBase changes) to build a list
    // of available `technologies` for filter buttons.
    useEffect(() => {
        let mounted = true;
        const fetchAllForTechList = async () => {
            try {
                const res = await axios.get(`${apiBase}/api/results`, {
                    headers: { "Content-Type": "application/json", ...getAuthHeader() },
                    timeout: 10000,
                });
                if (!mounted) return;
                if (res.status === 200 && res.data && res.data.success) {
                    const all = Array.isArray(res.data.results) ? res.data.results : [];
                    const set = new Set();
                    all.forEach((r) => {
                        if (r.technology) set.add(r.technology);
                    });
                    const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
                    console.log(arr);

                    setTechnologies(arr);
                } else {
                    // leave technologies empty (will still show "All")
                }
            } catch (err) {
                // silent — no need to block main UI; log for debug
                console.error(
                    "Failed to fetch technologies:",
                    err?.response?.data || err.message || err
                );
            }
        };
        fetchAllForTechList();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase, getAuthHeader]);

    const makeKey = (r) => (r && r._id ? r._id : `${r.id}||${r.title}`);

    // `summary` is memoized so it only recalculates when `results` changes.
    // It aggregates totals and computes an overall percentage.
    const summary = useMemo(() => {
        const source = Array.isArray(results) ? results : [];
        const totalQs = source.reduce(
            (s, r) => s + (Number(r.totalQuestions) || 0),
            0
        );
        const totalCorrect = source.reduce(
            (s, r) => s + (Number(r.correct) || 0),
            0
        );
        const totalWrong = source.reduce((s, r) => s + (Number(r.wrong) || 0), 0);
        const pct = totalQs ? Math.round((totalCorrect / totalQs) * 100) : 0;
        return { totalQs, totalCorrect, totalWrong, pct };
    }, [results]);

    // Group results by the first word of the title (used as "track")
    const grouped = useMemo(() => {
        const src = Array.isArray(results) ? results : [];
        const map = {};
        src.forEach((r) => {
            const track = (r.title || "").split(" ")[0] || "General";
            if (!map[track]) map[track] = [];
            map[track].push(r);
        });
        return map;
    }, [results]);

    // Handler called when user clicks a technology filter button
    const handleSelectTech = (tech) => {
        setSelectedTechnology(tech || "all");
    };

    return (
        <div className={resultStyles.pageContainer}>
            <div className={resultStyles.container}>
                <header className={resultStyles.header}>
                    <div>
                        <h1 className={resultStyles.title}>Quiz Results</h1>
                    </div>
                    <div className={resultStyles.headerControls} />
                </header>

                <div className={resultStyles.filterContainer}>
                    <div className={resultStyles.filterContent}>
                        <div className={resultStyles.filterButtons}>
                            <span className={resultStyles.filterLabel}>Filter by tech:</span>

                            <button onClick={() => handleSelectTech("all")} className={`${resultStyles.filterButton} ${selectedTechnology === "all"
                                ? resultStyles.filterButtonActive
                                : resultStyles.filterButtonInactive
                                }`}
                            >
                                All
                            </button>

                            {/* dynamic technology buttons */}
                            {technologies.map((tech) => (
                                <button
                                    key={tech}
                                    onClick={() => handleSelectTech(tech)}
                                    className={`${resultStyles.filterButton} ${selectedTechnology === tech
                                        ? resultStyles.filterButtonActive
                                        : resultStyles.filterButtonInactive
                                        }`}
                                >
                                    {tech}
                                </button>
                            ))}

                            {/* If we don't yet have technologies but results exist, derive from current results */}
                            {technologies.length === 0 &&
                                Array.isArray(results) &&
                                results.length > 0 &&
                                [
                                    ...new Set(results.map((r) => r.technology).filter(Boolean)),
                                ].map((tech) => (
                                    <button
                                        key={`fallback-${tech}`}
                                        onClick={() => handleSelectTech(tech)}
                                        className={`${resultStyles.filterButton} ${selectedTechnology === tech
                                            ? resultStyles.filterButtonActive
                                            : resultStyles.filterButtonInactive
                                            }`}
                                        aria-pressed={selectedTechnology === tech}
                                    >
                                        {tech}
                                    </button>
                                ))}
                        </div>
                        <div className={resultStyles.filterStatus}>
                            {selectedTechnology === "all"
                                ? "Showing all technologies"
                                : `Filtering: ${selectedTechnology}`}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={resultStyles.loadingContainer}>
                        <div className={resultStyles.loadingSpinner} />
                        <div className={resultStyles.loadingText}>
                            Loading results...
                        </div>
                    </div>
                ) : (
                    <>
                        {Object.entries(grouped).map(([track, items]) => (
                            <section key={track} className={resultStyles.trackSection}>
                                <h2 className={resultStyles.trackTitle}>{track} Track</h2>

                                <div className={resultStyles.resultsGrid}>
                                    {items.map((r) => (
                                        <StripCard key={makeKey(r)} item={r} />
                                    ))}
                                </div>
                            </section>
                        ))}

                        {Array.isArray(results) && results.length === 0 && !error && (
                            <div className={resultStyles.emptyState}>
                                No results yet. Take a quiz to see results here
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/* --------------------- StripCard component --------------------- */
function StripCard({ item }) {
    const percent = item.totalQuestions
        ? Math.round((Number(item.correct) / Number(item.totalQuestions)) * 100)
        : 0;

    const getLevel = (it) => {
        const id = (it.id || "").toString().toLowerCase();
        const title = (it.title || "").toString().toLowerCase();
        if (id.includes("basic") || title.includes(" basic"))
            return { letter: "B", style: resultStyles.levelBasic };
        if (id.includes("intermediate") || title.includes(" intermediate"))
            return { letter: "I", style: resultStyles.levelIntermediate };
        return { letter: "A", style: resultStyles.levelAdvanced };
    };

    const level = getLevel(item);

    return (
        <article className={resultStyles.card}>
            <div className={resultStyles.cardAccent}></div>

            <div className={resultStyles.cardContent}>
                <div className={resultStyles.cardHeader}>
                    <div className={resultStyles.cardInfo}>
                        <div className={`${resultStyles.levelAvatar} ${level.style}`}>
                            {level.letter}
                        </div>

                        <div className={resultStyles.cardText}>
                            <h3 className={resultStyles.cardTitle}>{item.title}</h3>

                            <div className={resultStyles.cardMeta}>
                                {item.totalQuestions} Qs
                                {item.timeSpent ? ` • ${item.timeSpent}` : ""}
                            </div>
                        </div>
                    </div>

                    <div className={resultStyles.cardPerformance}>
                        <div className={resultStyles.performanceLabel}>Performance</div>
                        <div className={resultStyles.badgeContainer}>
                            <Badge percent={percent} />
                        </div>
                    </div>
                </div>

                <div className={resultStyles.cardStats}>
                    <div className={resultStyles.statItem}>
                        Correct:
                        <span className={resultStyles.statNumber}>{item.correct}</span>
                    </div>

                    <div className={resultStyles.statItem}>
                        Wrong:
                        <span className={resultStyles.statNumber}>{item.wrong}</span>
                    </div>

                    <div className={resultStyles.statItem}>
                        Score:
                        <span className={resultStyles.statNumber}>{percent}%</span>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default MyResult;