import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const DEFAULT_PROCEDURE_IMG =
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80";

export const clinicalProcedures = [
  // ==========================================
  // 1. SKIN CLINICAL PROCEDURES
  // ==========================================
  {
    id: "skin-1",
    name: "Q-Switched Nd:YAG Laser Toning & Carbon Peel",
    category: "Skin Procedures",
    subCategory: "Laser & Pigmentation",
    tag: "US-FDA Approved Laser",
    price: 3500,
    duration: "45 Mins",
    downtime: "Zero Downtime",
    sessions: "4-6 Sessions",
    technology: "1064nm / 532nm Dual Pulse Nd:YAG Laser",
    rating: "4.9 ★",
    img: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
    desc: "Breaks deep dermal melanin clusters, tightens open pores, and eradicates stubborn melasma and sun tanning.",
    protocol: [
      "Targeted pigment fragmentation without surface thermal burns",
      "Hollywood Carbon Laser crust exfoliation for instant glow",
      "Cryo-calming antioxidant sheet infusion",
    ],
  },

  {
    id: "skin-2",
    name: "Medical Hydra-Vortex Dermabrasion & Infusion",
    category: "Skin Procedures",
    subCategory: "Facial & Glow",
    tag: "Celebrity Glow Protocol",
    price: 2800,
    duration: "60 Mins",
    downtime: "Instant Radiance",
    sessions: "Monthly Maintenance",
    technology: "Patented Vortex Hydro-Vacuum + LED Phototherapy",
    rating: "4.9 ★",
    img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    desc: "Multi-stage deep pore vacuuming, painless blackhead extraction, and trans-epidermal hyaluronic acid infusion.",
    protocol: [
      "Deep exfoliation with lactic and salicylic fluid wash",
      "Vortex suction of sebum plugs and dead keratin cells",
      "Micro-current skin tightening and cold hammer seal",
    ],
  },

  {
    id: "skin-3",
    name: "MNRF (Micro-Needling Fractional Radiofrequency)",
    category: "Skin Procedures",
    subCategory: "Acne Scars & Texture",
    tag: "Scar Resurfacing",
    price: 5500,
    duration: "60 Mins",
    downtime: "24-48 Hours",
    sessions: "3-4 Sessions",
    technology: "Gold-Plated Insulated Micro-Needles + Thermal RF",
    rating: "4.8 ★",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    desc: "Clinically remodels deep boxcar and ice-pick acne scars, shrinks dilated pores, and tightens sagging facial contours.",
    protocol: [
      "Targeted thermal coagulative micro-injuries in dermis",
      "Stimulates natural Type I & III collagen synthesis",
      "Application of sterile peptide healing cocktail",
    ],
  },

  {
    id: "skin-4",
    name: "HIFU (High-Intensity Focused Ultrasound) Non-Surgical Face Lift",
    category: "Skin Procedures",
    subCategory: "Anti-Ageing & Lifting",
    tag: "SMAS Layer Contouring",
    price: 8500,
    duration: "75 Mins",
    downtime: "Zero Downtime",
    sessions: "1-2 Sessions / Year",
    technology: "Focused Ultrasound Transducers (1.5mm, 3.0mm, 4.5mm)",
    rating: "5.0 ★",
    img: "https://images.unsplash.com/photo-1512290903671-17adc520970a?auto=format&fit=crop&w=800&q=80",
    desc: "Reaches the SMAS muscle layer to lift sagging jowls, sharpen the jawline, and smoothen neck bands without surgery.",
    protocol: [
      "Non-invasive thermal coagulation zones at 65°C depth",
      "Structural facial tightening and wrinkle reduction",
      "Progressive lifting over 90 days",
    ],
  },

  {
    id: "skin-5",
    name: "Triple-Wave Ice Diode Laser Hair Reduction",
    category: "Skin Procedures",
    subCategory: "Laser & Body",
    tag: "Painless Chill-Tip",
    price: 4200,
    duration: "45 Mins",
    downtime: "Zero Downtime",
    sessions: "6-8 Sessions",
    technology: "755nm + 808nm + 1064nm Triple Diode Chill Laser",
    rating: "4.9 ★",
    img: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
    desc: "Permanent reduction of unwanted face and body hair with continuous contact cooling for complete painlessness.",
    protocol: [
      "Selective photothermolysis destroys follicle germ cells",
      "Safe for Indian skin types (Fitzpatrick IV-VI)",
      "Zero razor bumps, ingrown hairs, or surface burns",
    ],
  },

  {
    id: "skin-6",
    name: "Dermatological Chemical Peels (Salicylic / TCA Cross / Glycolic)",
    category: "Skin Procedures",
    subCategory: "Acne & Pigmentation",
    tag: "Medical-Grade Exfoliation",
    price: 2200,
    duration: "30 Mins",
    downtime: "2-3 Days Mild Flaking",
    sessions: "3-5 Sessions",
    technology: "Controlled pH Medical Organic Acids",
    rating: "4.8 ★",
    img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    desc: "Accelerates cellular turnover to dry active cystic acne, fade post-inflammatory hyperpigmentation, and brighten skin.",
    protocol: [
      "Custom formulation selection based on skin Fitzpatrick scale",
      "Controlled acid layering and neutralization",
      "Post-peel soothing ceramide and zinc shield",
    ],
  },

  {
    id: "skin-7",
    name: "Bio-Cellular Exosome Skin Rejuvenation Therapy",
    category: "Skin Procedures",
    subCategory: "Anti-Ageing & Lifting",
    tag: "Next-Gen Regenerative Tech",
    price: 9500,
    duration: "60 Mins",
    downtime: "12-24 Hours",
    sessions: "3 Sessions",
    technology: "Lyophilized Exosomes (5 Billion Nano-Vesicles) + Microneedling",
    rating: "5.0 ★",
    img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80",
    desc: "Cutting-edge biotech treatment delivering billions of regenerative signaling molecules to repair aging skin barriers.",
    protocol: [
      "Fractional trans-dermal micro-channels creation",
      "Direct infusion of stem-cell-derived bioactive exosomes",
      "Rapid reduction in inflammatory redness and fine lines",
    ],
  },

  {
    id: "skin-8",
    name: "Tri-Wave Medical LED Photobiomodulation",
    category: "Skin Procedures",
    subCategory: "Facial & Glow",
    tag: "Non-Thermal Light Therapy",
    price: 1800,
    duration: "30 Mins",
    downtime: "Zero Downtime",
    sessions: "4-6 Sessions",
    technology: "415nm Blue / 633nm Red / 830nm Near-Infrared LED",
    rating: "4.7 ★",
    img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
    desc: "Blue light kills acne-causing P. acnes bacteria while red/infrared light triggers ATP production for healing.",
    protocol: [
      "Kills surface bacteria without topical antibiotics",
      "Calms post-inflammatory erythema (redness)",
      "Stimulates cellular mitochondrial rejuvenation",
    ],
  },

  // ==========================================
  // 2. HAIR CLINICAL PROCEDURES
  // ==========================================
  {
    id: "hair-1",
    name: "Scalp Growth Factor Concentrate (GFC) Therapy",
    category: "Hair Procedures",
    subCategory: "Hair Loss & Regrowth",
    tag: "Advanced 2nd Gen PRP",
    price: 6500,
    duration: "60 Mins",
    downtime: "Zero Downtime",
    sessions: "3-4 Sessions",
    technology: "Acellular Bio-Engineered Growth Factor Kit",
    rating: "5.0 ★",
    img: "https://images.unsplash.com/photo-1585232351009-aa87416fca90?auto=format&fit=crop&w=800&q=80",
    desc: "Releases high concentrations of PDGF, VEGF, and EGF directly into hair roots to arrest hair fall and stimulate dormant follicles.",
    protocol: [
      "Painless extraction of high-purity autologous growth factors",
      "Micro-droplet intradermal delivery into thinning patches",
      "Zero RBC/WBC contamination for maximum safety and comfort",
    ],
  },

  {
    id: "hair-2",
    name: "Autologous Platelet-Rich Plasma (PRP) Scalp Protocol",
    category: "Hair Procedures",
    subCategory: "Hair Loss & Regrowth",
    tag: "Clinical Trichology Gold Standard",
    price: 4500,
    duration: "60 Mins",
    downtime: "Zero Downtime",
    sessions: "4-6 Sessions",
    technology: "Double-Spin Density Centrifugation (5x Platelet Baseline)",
    rating: "4.8 ★",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    desc: "Concentrates your blood's natural healing platelets to nourish miniaturized hair shafts and enhance hair thickness.",
    protocol: [
      "Precision separation of concentrated platelet buffy coat",
      "Scalp activation with microneedling and micro-injections",
      "Trichoscan digital photographic progress tracking",
    ],
  },

  {
    id: "hair-3",
    name: "Scalp Detox & Micro-Oxygen Jet Clarification",
    category: "Hair Procedures",
    subCategory: "Dandruff & Scalp Health",
    tag: "Pore & Flake Exfoliation",
    price: 2500,
    duration: "45 Mins",
    downtime: "Instant Scalp Refresh",
    sessions: "Monthly Maintenance",
    technology: "Supersonic Oxygen Jet Sprayer (200 m/s)",
    rating: "4.9 ★",
    img: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
    desc: "High-velocity saline and oxygen jets flush out stubborn fungal dandruff flakes, product crust, and excess sebum.",
    protocol: [
      "Non-contact supersonic follicle unclogging",
      "Salicylic and Ketoconazole scalp micro-peel application",
      "Infusion of antibacterial zinc and menthol extracts",
    ],
  },

  {
    id: "hair-4",
    name: "Scalp Microneedling with Bio-Peptide Mesotherapy",
    category: "Hair Procedures",
    subCategory: "Hair Loss & Regrowth",
    tag: "Collagen & Density Booster",
    price: 3800,
    duration: "45 Mins",
    downtime: "12 Hours",
    sessions: "4-6 Sessions",
    technology: "Automated Micro-Needle Pen (0.5mm - 1.5mm) + Copper Peptides",
    rating: "4.8 ★",
    img: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
    desc: "Creates controlled micro-punctures on the scalp to induce the Wnt/β-catenin signaling pathway for hair density.",
    protocol: [
      "Mechanical stimulation of dermal papilla stem cells",
      "Direct infusion of Redensyl, Procapil, and Biotin complexes",
      "Enhances scalp absorption of topical minoxidil/serums by 80%",
    ],
  },

  {
    id: "hair-5",
    name: "Low-Level Laser Therapy (LLLT) Scalp Helmet Protocol",
    category: "Hair Procedures",
    subCategory: "Hair Loss & Regrowth",
    tag: "Non-Invasive Cold Laser",
    price: 1500,
    duration: "30 Mins",
    downtime: "Zero Downtime",
    sessions: "8-10 Sessions",
    technology: "650nm Medical-Grade Cold Diode Laser Array",
    rating: "4.7 ★",
    img: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
    desc: "Red light phototherapy boosts cellular respiration in hair follicle cells to revert miniaturization.",
    protocol: [
      "Increases ATP synthesis and nitric oxide vasodilation",
      "Extends the active Anagen (growth) cycle of hair",
      "100% painless and non-invasive therapy",
    ],
  },

  {
    id: "hair-6",
    name: "Scalp Exosome Follicular Revival Infusion",
    category: "Hair Procedures",
    subCategory: "Advanced Hair Tech",
    tag: "Biotech Cellular Regrowth",
    price: 11000,
    duration: "60 Mins",
    downtime: "Zero Downtime",
    sessions: "2-3 Sessions",
    technology: "Purified Plant/Cellular Exosomes + Scalp Dermapen",
    rating: "5.0 ★",
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    desc: "Delivers millions of micro-RNA and protein packets that instruct dormant follicular stem cells to regenerate.",
    protocol: [
      "Targeted for advanced male and female pattern androgenetic alopecia",
      "Combats DHT-mediated follicular apoptosis (shrinkage)",
      "Noticeable improvement in hair strand thickness within 60 days",
    ],
  },

  {
    id: "hair-7",
    name: "Clinical Keratin Bond Reconstruction & Anti-Breakage",
    category: "Hair Procedures",
    subCategory: "Damage Repair & Conditioning",
    tag: "Hair Shaft Fortification",
    price: 3200,
    duration: "60 Mins",
    downtime: "Instant Softness",
    sessions: "Monthly Maintenance",
    technology: "Hydrolyzed Silk Keratin + Infrared Ultrasonic Flat Iron",
    rating: "4.9 ★",
    img: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80",
    desc: "Restores fractured disulfide and ionic bonds in heat-damaged, dyed, or bleached hair shafts.",
    protocol: [
      "Ultrasonic cold penetration of micro-amino acids",
      "Seals porous hair cuticles to prevent environmental moisture loss",
      "Eliminates frizz and strengthens brittle ends",
    ],
  },

  {
    id: "hair-8",
    name: "Seborrheic Dermatitis & Scalp Acne Clarifying Treatment",
    category: "Hair Procedures",
    subCategory: "Dandruff & Scalp Health",
    tag: "Anti-Inflammatory Scalp Care",
    price: 2600,
    duration: "45 Mins",
    downtime: "Zero Downtime",
    sessions: "3-4 Sessions",
    technology: "High-Frequency Ozone Comb + Tea Tree Bio-Peel",
    rating: "4.8 ★",
    img: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
    desc: "Ozone gas therapy combined with botanical active peels to sterilize folliculitis pustules and soothe intense scalp redness.",
    protocol: [
      "High-frequency antibacterial sterilization of pustules",
      "Anti-itch botanical scalp mask with zinc and chamomile",
      "Restores the scalp's delicate lipid acid mantle",
    ],
  },
];

const skinSubCategories = [
  "All Skin",
  "Laser & Pigmentation",
  "Facial & Glow",
  "Acne Scars & Texture",
  "Anti-Ageing & Lifting",
  "Laser & Body",
  "Acne & Pigmentation",
];

const hairSubCategories = [
  "All Hair",
  "Hair Loss & Regrowth",
  "Dandruff & Scalp Health",
  "Advanced Hair Tech",
  "Damage Repair & Conditioning",
];

const Services = () => {
  const [activeMainCategory, setActiveMainCategory] =
    useState("Skin Procedures");

  const [selectedSub, setSelectedSub] = useState("All");

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const activeSubList =
    activeMainCategory === "Skin Procedures"
      ? skinSubCategories
      : hairSubCategories;

  const filtered = clinicalProcedures.filter((procedure) => {
    const matchMain =
      procedure.category === activeMainCategory;

    const matchSub =
      selectedSub === "All" ||
      selectedSub.startsWith("All") ||
      procedure.subCategory === selectedSub;

    const matchSearch =
      procedure.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      procedure.desc
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      procedure.technology
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      procedure.subCategory
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchMain && matchSub && matchSearch;
  });

  // --------------------------------------------------
  // BOOK PROCEDURE
  // Sends selected service to Appointment page
  // --------------------------------------------------
  const handleBookProcedure = (procedure) => {
    navigate("/appointment", {
      state: {
        selectedProcedure: procedure,
      },
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafb",
        minHeight: "88vh",
        padding: "2.5rem 0 5rem 0",
      }}
    >
      <div className="container">

        {/* ==========================================
            HERO HEADER
        ========================================== */}
        <div
          className="p-4 p-md-5 rounded-4 shadow-sm mb-4 text-white position-relative"
          style={{
            background:
              "linear-gradient(135deg, #0e3b43 0%, #175a66 100%)",
            border:
              "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">

            <div>
              <span className="badge bg-white text-dark rounded-pill px-3 py-1 mb-2 fw-semibold">
                🏥 Certified Clinical Procedures & Technologies
              </span>

              <h2 className="fw-bold mb-2">
                Advanced Skin & Trichology Procedures
              </h2>

              <p
                className="text-white-50 mb-0"
                style={{ maxWidth: "680px" }}
              >
                Conducted by certified dermatologists and aesthetic
                surgeons using US-FDA approved laser, RF, ultrasound,
                and regenerative protocols.
              </p>
            </div>

            <div className="d-flex gap-2">
              <Link
                to="/service-offers"
                className="btn btn-warning rounded-pill px-4 fw-bold btn-sm shadow-sm"
              >
                View Package Offers ⚡
              </Link>
            </div>

          </div>
        </div>

        {/* ==========================================
            MAIN CATEGORY SWITCHER
        ========================================== */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">

          <div className="d-flex gap-2">

            <button
              type="button"
              onClick={() => {
                setActiveMainCategory("Skin Procedures");
                setSelectedSub("All");
              }}
              className={`btn rounded-pill px-4 py-2 fw-bold shadow-sm ${
                activeMainCategory === "Skin Procedures"
                  ? "btn-dark"
                  : "btn-light border"
              }`}
              style={{ fontSize: "0.95rem" }}
            >
              🧴 Clinical Skin Procedures (8)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMainCategory("Hair Procedures");
                setSelectedSub("All");
              }}
              className={`btn rounded-pill px-4 py-2 fw-bold shadow-sm ${
                activeMainCategory === "Hair Procedures"
                  ? "btn-dark"
                  : "btn-light border"
              }`}
              style={{ fontSize: "0.95rem" }}
            >
              💆 Clinical Hair & Scalp Procedures (8)
            </button>

          </div>

          {/* Search */}
          <input
            type="text"
            className="form-control rounded-pill px-3 form-control-sm"
            style={{ maxWidth: "320px" }}
            placeholder={`Search ${activeMainCategory}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* ==========================================
            SUB CATEGORY FILTER
        ========================================== */}
        <div className="d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom">

          {activeSubList.map((sub) => {

            const isAll = sub.startsWith("All");

            const isSelected =
              selectedSub === sub ||
              (isAll && selectedSub === "All");

            return (
              <button
                type="button"
                key={sub}
                onClick={() =>
                  setSelectedSub(
                    isAll ? "All" : sub
                  )
                }
                className={`btn btn-sm rounded-pill px-3 ${
                  isSelected
                    ? "btn-primary text-white"
                    : "btn-outline-secondary"
                }`}
                style={{ fontSize: "0.82rem" }}
              >
                {sub}
              </button>
            );
          })}

        </div>

        {/* ==========================================
            PROCEDURES GRID
        ========================================== */}
        <div className="row g-4">

          {filtered.length === 0 ? (

            <div className="col-12">
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <h5 className="fw-bold">
                  No procedures found
                </h5>

                <p className="text-muted mb-0">
                  Try another search or category.
                </p>
              </div>
            </div>

          ) : (

            filtered.map((proc) => (

              <div
                key={proc.id}
                className="col-md-6 col-lg-4"
              >

                <div
                  className="card h-100 border-0 rounded-4 shadow-sm bg-white overflow-hidden d-flex flex-column"
                >

                  {/* ==================================
                      IMAGE
                  ================================== */}
                  <div
                    className="position-relative"
                    style={{
                      height: "220px",
                      overflow: "hidden",
                      backgroundColor: "#f2f5f6",
                    }}
                  >

                    <span
                      className="position-absolute top-0 start-0 badge m-3 shadow-sm"
                      style={{
                        backgroundColor: "#0e3b43",
                        fontSize: "0.75rem",
                        zIndex: 2,
                      }}
                    >
                      {proc.tag}
                    </span>

                    <span
                      className="position-absolute top-0 end-0 badge bg-warning text-dark m-3 shadow-sm fw-bold"
                      style={{
                        fontSize: "0.75rem",
                        zIndex: 2,
                      }}
                    >
                      {proc.rating}
                    </span>

                    <img
                      src={proc.img}
                      alt={proc.name}
                      className="w-100 h-100 object-fit-cover"
                      style={{
                        transition:
                          "transform 0.3s ease",
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          DEFAULT_PROCEDURE_IMG;
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "scale(1)";
                      }}
                    />

                  </div>

                  {/* ==================================
                      BODY
                  ================================== */}
                  <div className="p-4 d-flex flex-column flex-grow-1">

                    <div className="d-flex justify-content-between align-items-center mb-2">

                      <span className="badge bg-light text-primary border">
                        {proc.subCategory}
                      </span>

                      <span className="small text-muted fw-semibold">
                        ⏱️ {proc.duration}
                      </span>

                    </div>

                    <h5
                      className="fw-bold text-dark mb-2"
                      style={{ fontSize: "1.05rem" }}
                    >
                      {proc.name}
                    </h5>

                    <p className="small text-muted mb-3">
                      {proc.desc}
                    </p>

                    {/* ==================================
                        CLINICAL SPECIFICATIONS
                    ================================== */}
                    <div className="bg-light p-3 rounded-3 mb-3 border">

                      <div className="row g-2 small text-secondary mb-2">

                        <div className="col-6">

                          <span
                            className="text-muted d-block"
                            style={{
                              fontSize: "0.72rem",
                            }}
                          >
                            DOWNTIME:
                          </span>

                          <strong className="text-dark">
                            {proc.downtime}
                          </strong>

                        </div>

                        <div className="col-6">

                          <span
                            className="text-muted d-block"
                            style={{
                              fontSize: "0.72rem",
                            }}
                          >
                            SESSIONS:
                          </span>

                          <strong className="text-dark">
                            {proc.sessions}
                          </strong>

                        </div>

                      </div>

                      <div className="border-top pt-2">

                        <span
                          className="text-muted d-block"
                          style={{
                            fontSize: "0.72rem",
                          }}
                        >
                          EQUIPMENT / TECHNOLOGY:
                        </span>

                        <strong
                          className="text-dark"
                          style={{
                            fontSize: "0.78rem",
                          }}
                        >
                          {proc.technology}
                        </strong>

                      </div>

                    </div>

                    {/* ==================================
                        PROCEDURE HIGHLIGHTS
                    ================================== */}
                    <div className="mb-3">

                      <div className="small fw-bold text-dark mb-1">
                        🔬 Procedure Highlights:
                      </div>

                      <ul
                        className="list-unstyled mb-0 small text-muted"
                        style={{
                          fontSize: "0.78rem",
                        }}
                      >

                        {proc.protocol.map(
                          (step, idx) => (

                            <li
                              key={idx}
                              className="d-flex align-items-start gap-1 mb-1"
                            >
                              <span className="text-success fw-bold">
                                ✓
                              </span>

                              {step}
                            </li>

                          )
                        )}

                      </ul>

                    </div>

                    {/* ==================================
                        PRICE + BOOK BUTTON
                    ================================== */}
                    <div
                      className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto"
                    >

                      <div>

                        <span
                          className="text-muted"
                          style={{
                            fontSize: "0.72rem",
                          }}
                        >
                          Session Starting at
                        </span>

                        <h4 className="fw-bold text-dark mb-0">
                          ₹{proc.price}
                        </h4>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleBookProcedure(proc)
                        }
                        className="btn rounded-pill px-4 fw-bold text-white shadow-sm"
                        style={{
                          backgroundColor: "#0e3b43",
                        }}
                      >
                        Book Procedure →
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>
    </div>
  );
};

export default Services;