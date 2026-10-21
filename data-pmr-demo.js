/* Synthetic PMR research portfolio for Abbott 360 prototype.
   All respondent-level values, quotations and project results are demo data. */

window.PMR_METHOD_SOURCES=[
  {label:"AHRQ — Patient Experience and CAHPS",url:"https://www.ahrq.gov/cahps/about-cahps/patient-experience/index.html"},
  {label:"AHRQ — Patient Narrative Item Sets",url:"https://www.ahrq.gov/cahps/surveys-guidance/item-sets/elicitation/index.html"},
  {label:"FDA — Patient Preference Information",url:"https://www.fda.gov/about-fda/division-patient-centered-development/patient-preference-information-ppi-medical-device-decision-making"}
];

window.PMR_DOMAIN_CONFIG={
  "Autoimmunity & Allergy":{
    personas:["Allergist / Immunologist","Rheumatologist","Laboratory Director","Primary Care Physician","Nurse / Medical Assistant","Patient / Caregiver"],
    expertTypes:["Allergy KOL","Rheumatology KOL","Immunology Lab Director","Health-system Medical Director","Payer / Access Expert"],
    settings:["Academic Medical Center","Specialty Clinic","Reference Laboratory","Community Practice","Integrated Health System"],
    regions:["North America","Europe","Asia-Pacific","Latin America"],
    themes:["Diagnostic accuracy","Time to diagnosis","Interpretation support","Testing access & reimbursement","Multiplex / reflex testing","Patient education","Laboratory workflow","Specialist referral"],
    drivers:["Clinical confidence","Faster differential diagnosis","Actionable interpretation","Broad assay menu","Ease of ordering","Reimbursement support"],
    barriers:["Ambiguous symptoms","Long referral journey","Coverage uncertainty","Result complexity","Cross-platform variability","Limited specialist capacity"],
    products:["Specific IgE / component testing","Autoimmune serology panels","Multiplex immunology assays","Interpretive reporting","Reflex testing algorithms"],
    projectStem:"Immunology",
    recommendations:[
      "Pair high-complexity testing with clear interpretive guidance that tells clinicians what to do next.",
      "Design referral and reflex pathways that shorten the diagnostic journey before specialist capacity becomes a bottleneck.",
      "Segment value propositions by specialist, generalist and laboratory user rather than using one technical message.",
      "Prioritize access evidence and ordering simplicity for advanced multiplex and component-resolved testing.",
      "Use patient education to reduce anxiety around uncertain or multi-step diagnostic pathways."
    ],
    quoteSeeds:[
      ["Allergist / Immunologist","The value is not another marker by itself; it is whether the result changes what I do with the patient."],
      ["Rheumatologist","The difficult cases are the ones where symptoms overlap, so interpretation matters almost as much as the assay."],
      ["Laboratory Director","If a specialty test adds manual work, I need a clear clinical reason and a predictable workflow."],
      ["Patient / Caregiver","The hardest part was not the test. It was understanding why I needed several tests and what the results meant."]
    ]
  },
  "Diabetes & Blood Glucose Monitoring":{
    personas:["Endocrinologist","Primary Care Physician","Diabetes Educator / Nurse","Pharmacist","Person with Type 1 Diabetes","Person with Type 2 Diabetes / Caregiver"],
    expertTypes:["Endocrinology KOL","Diabetes Technology KOL","Diabetes Educator Leader","Payer / Access Expert","Digital Health Expert"],
    settings:["Diabetes Center","Primary Care","Retail / Pharmacy","Hospital Outpatient","Home / Remote Care"],
    regions:["North America","Europe","Asia-Pacific","Latin America"],
    themes:["Sensor accuracy & reliability","Wearability & comfort","Alert burden","Automated insulin delivery","Data interpretation","Affordability & coverage","Device interoperability","Coaching & behavior change"],
    drivers:["Accuracy","Ease of use","Reduced burden","Interoperability","Actionable trends","Coverage / affordability"],
    barriers:["Skin / wear issues","Alarm fatigue","Cost","Data overload","Training burden","Fragmented device ecosystem"],
    products:["CGM","Blood glucose monitoring","Automated insulin delivery","Smart pens","Digital coaching / remote monitoring"],
    projectStem:"Diabetes Technology",
    recommendations:[
      "Design for lower daily cognitive burden, not only better sensor or algorithm performance.",
      "Make interoperability and app simplicity visible parts of the value proposition for both users and clinicians.",
      "Differentiate support models for intensive insulin users versus broader type 2 / wellness populations.",
      "Use coverage navigation and onboarding support to reduce abandonment before sustained use begins.",
      "Translate glucose data into prioritized actions rather than more charts and alerts."
    ],
    quoteSeeds:[
      ["Endocrinologist","The data are valuable only if I can see the pattern quickly and know what needs attention."],
      ["Diabetes Educator / Nurse","Training time falls when the device behaves the way patients already expect a phone app to behave."],
      ["Person with Type 1 Diabetes","Accuracy matters, but so does whether I can forget about the device for part of the day."],
      ["Person with Type 2 Diabetes / Caregiver","I want the numbers to tell me what habit is helping, not just whether I was high or low."]
    ]
  },
  "Ophthalmology & Eye Health":{
    personas:["Cataract Surgeon","Retina Specialist","Glaucoma Specialist","Optometrist","Ophthalmic Technician / Nurse","Patient / Caregiver"],
    expertTypes:["Cataract KOL","Retina KOL","Glaucoma KOL","Optometry Leader","Ophthalmic Imaging Expert"],
    settings:["Academic Eye Center","Ambulatory Surgery Center","Private Ophthalmology Practice","Optometry Practice","Integrated Eye Network"],
    regions:["North America","Europe","Asia-Pacific","Latin America"],
    themes:["Image quality","Workflow integration","Diagnostic confidence","Premium IOL counseling","Procedure efficiency","Capital cost","Patient education","Longitudinal data"],
    drivers:["Clinical image quality","Fast acquisition","Workflow connectivity","Procedure predictability","Patient experience","Service reliability"],
    barriers:["Capital budget","Learning curve","Data silos","Patient affordability","Device footprint","Workflow disruption"],
    products:["OCT / retinal imaging","Cataract platforms","IOLs","Refractive systems","Digital eye-care workflow"],
    projectStem:"Ophthalmology",
    recommendations:[
      "Link imaging and surgical planning into one longitudinal workflow rather than selling standalone devices.",
      "Separate premium-patient counseling needs from surgeon-facing technical differentiation.",
      "Demonstrate throughput and staff-efficiency impact alongside clinical performance for capital equipment.",
      "Design digital tools that reduce duplicate data entry across imaging, planning and post-operative follow-up.",
      "Use patient-friendly visualization to support shared decisions for premium and elective procedures."
    ],
    quoteSeeds:[
      ["Cataract Surgeon","The best technology is the one that improves confidence without adding another step before I enter the OR."],
      ["Retina Specialist","Longitudinal comparison is more useful than another isolated image."],
      ["Ophthalmic Technician / Nurse","Automation helps only if it also reduces repeats and manual cleanup."],
      ["Patient / Caregiver","I understood my options much better when someone showed me what the image meant for my vision."]
    ]
  },
  "Orthopedics & Sports Medicine":{
    personas:["Orthopedic Surgeon","Sports Medicine Surgeon","Physical Therapist","OR Nurse / Surgical Tech","Hospital / ASC Administrator","Patient / Athlete"],
    expertTypes:["Joint Reconstruction KOL","Sports Medicine KOL","Spine / Robotics KOL","ASC Leader","Orthopedic Health Economist"],
    settings:["Academic Hospital","Ambulatory Surgery Center","Private Orthopedic Practice","Sports Medicine Center","Rehabilitation Clinic"],
    regions:["North America","Europe","Asia-Pacific","Latin America"],
    themes:["Procedure reproducibility","Robotics / navigation","Implant confidence","OR efficiency","ASC suitability","Rehabilitation burden","Evidence & outcomes","Capital economics"],
    drivers:["Clinical outcomes","Workflow efficiency","Surgeon control","Reproducibility","ASC economics","Training / service"],
    barriers:["Capital cost","Learning curve","OR setup time","Implant switching resistance","Evidence requirements","Staff training"],
    products:["Joint implants","Sports medicine repair","Robotics / navigation","Trauma systems","Rehabilitation technology"],
    projectStem:"Orthopedic Innovation",
    recommendations:[
      "Frame enabling technology around reproducibility, staff efficiency and site-of-care economics—not novelty alone.",
      "Segment surgeon needs by procedure volume, digital maturity and current implant ecosystem.",
      "Quantify OR setup and turnover impact when introducing robotics or navigation into ASCs.",
      "Support adoption with training pathways that include the full OR team, not only surgeons.",
      "Build evidence packages that connect technical accuracy to patient recovery and institutional economics."
    ],
    quoteSeeds:[
      ["Orthopedic Surgeon","I will adopt technology if it makes the hard cases more predictable without slowing my routine cases."],
      ["OR Nurse / Surgical Tech","A system can be impressive clinically and still fail if setup is too complicated."],
      ["Hospital / ASC Administrator","I need to see utilization and throughput, not just a better technical specification."],
      ["Patient / Athlete","Recovery time and confidence in getting back to activity matter more to me than the name of the implant."]
    ]
  },
  "Advanced Wound Management":{
    personas:["Wound Care Nurse","Podiatrist","Plastic / Reconstructive Surgeon","Vascular Surgeon","Home Health Nurse","Patient / Caregiver","Wound Center Administrator"],
    expertTypes:["Wound Care KOL","Podiatry KOL","Vascular KOL","Reconstructive Surgery KOL","Reimbursement / Access Expert"],
    settings:["Hospital Wound Center","Outpatient Wound Clinic","Home Health","Skilled Nursing Facility","Surgical Service"],
    regions:["North America","Europe","Asia-Pacific","Latin America"],
    themes:["Healing progression","Dressing change burden","Exudate management","NPWT usability","Skin substitute evidence","Reimbursement complexity","Home-care adherence","Documentation burden"],
    drivers:["Healing outcomes","Ease of application","Wear time","Patient comfort","Evidence strength","Reimbursement support"],
    barriers:["Coverage complexity","Frequent dressing changes","Caregiver burden","Product waste","Training variation","Documentation requirements"],
    products:["Advanced dressings","NPWT","Skin substitutes / CTPs","Regenerative matrices","Digital wound monitoring"],
    projectStem:"Wound Management",
    recommendations:[
      "Prioritize solutions that reduce total care burden across dressing changes, documentation and patient travel.",
      "Separate clinical-evidence messaging from reimbursement-support messaging for advanced biologic products.",
      "Design home-care instructions around caregiver capability and real-world adherence constraints.",
      "Use wound progression visualization to support both clinical decisions and patient motivation.",
      "Quantify product waste, nursing time and visit frequency when building economic value stories."
    ],
    quoteSeeds:[
      ["Wound Care Nurse","A product is not easier if it saves one step but creates two documentation steps."],
      ["Podiatrist","I need confidence that the wound is progressing before I escalate to a more expensive option."],
      ["Home Health Nurse","The best dressing is the one the patient and caregiver can actually manage between visits."],
      ["Patient / Caregiver","Every extra clinic visit affects work, transport and the person helping me at home."]
    ]
  },
  "Clinical Laboratory Services":{
    personas:["Laboratory Director","Pathologist","Hospital Administrator","Ordering Physician","Phlebotomy / Lab Operations Manager","Nurse","Patient / Consumer"],
    expertTypes:["Laboratory Medicine KOL","Pathology KOL","Health-system Lab Executive","Utilization / Stewardship Expert","Payer / Value-based Care Expert"],
    settings:["Health-system Core Lab","Reference Laboratory","Hospital Laboratory","Outpatient / Physician Office","Consumer / Direct Access"],
    regions:["North America","Europe","Asia-Pacific","Latin America"],
    themes:["Turnaround time","Test-menu breadth","Result interpretation","Send-out management","EHR / LIS integration","Utilization stewardship","Service reliability","Patient access"],
    drivers:["Reliable TAT","Clinical quality","Connectivity","Specialty-test access","Decision support","Account service"],
    barriers:["Interface burden","Staff shortages","Send-out complexity","Result fragmentation","Reimbursement pressure","Manual follow-up"],
    products:["Routine laboratory services","Esoteric / specialty testing","Molecular / genetics","Pathology","Lab analytics / decision support"],
    projectStem:"Laboratory Services",
    recommendations:[
      "Differentiate on workflow integration and actionability, not only test-menu breadth.",
      "Prioritize native EHR / LIS connectivity for high-frequency operational use cases.",
      "Create distinct value stories for laboratory leaders, ordering clinicians, administrators and patients.",
      "Use stewardship analytics to convert test utilization data into specific next actions.",
      "Package specialty testing with logistics, interpretation and service support to reduce send-out friction."
    ],
    quoteSeeds:[
      ["Laboratory Director","I do not need another dashboard unless it helps my team decide what to fix today."],
      ["Ordering Physician","The result is valuable when the interpretation is clear enough to change the next clinical step."],
      ["Hospital Administrator","Turnaround time matters, but so do leakage, staffing and the cost of managing exceptions."],
      ["Patient / Consumer","I want to know what the result means and what I should do next without searching three different places."]
    ]
  }
};

function pmrHash(str){let h=2166136261;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function pmrClamp(v,min=0,max=100){return Math.max(min,Math.min(max,Math.round(v)))}
function pmrScore(domain,label,offset=0){return pmrClamp(52+(pmrHash(domain+"|"+label)%38)+offset)}
function pmrProjectDate(i){return ["2025 Q4","2026 Q1","2026 Q1","2026 Q2","2026 Q2","2026 Q3","2026 Q3"][i]}

window.PMR_DEMO_DATA={};
Object.entries(window.PMR_DOMAIN_CONFIG).forEach(([domain,cfg])=>{
  const samples=[24,20,18,15,240,300,220].map((n,i)=>n+(pmrHash(domain+"sample"+i)%9));
  const projects=[
    {id:"voc-core",name:cfg.projectStem+" End-user Voice of Customer",type:"In-depth interviews",method:"60-minute semi-structured IDIs",sample:samples[0],audience:cfg.personas.slice(0,5),period:pmrProjectDate(0),markets:cfg.regions.slice(0,3),purpose:"Understand unmet needs, workflow pain points, current-solution gaps and decision drivers."},
    {id:"journey",name:cfg.projectStem+" Patient / User Journey Study",type:"Patient / caregiver interviews",method:"45-minute journey interviews + task reconstruction",sample:samples[1],audience:cfg.personas.slice(-2),period:pmrProjectDate(1),markets:cfg.regions.slice(0,2),purpose:"Map end-to-end experience, burden, education gaps and moments of truth."},
    {id:"workflow",name:cfg.projectStem+" Workflow & Usability Ethnography",type:"Workflow observation + IDI",method:"Contextual interview / workflow reconstruction",sample:samples[2],audience:cfg.personas.slice(0,4),period:pmrProjectDate(2),markets:cfg.regions.slice(0,2),purpose:"Identify handoffs, workarounds, time burden and implementation friction."},
    {id:"kol-future",name:cfg.projectStem+" Future-state KOL Study",type:"Expert & KOL interviews",method:"60-minute expert interviews",sample:samples[3],audience:cfg.expertTypes,period:pmrProjectDate(3),markets:cfg.regions.slice(0,4),purpose:"Test future-state hypotheses, innovation priorities, adoption barriers and evidence expectations."},
    {id:"adoption-survey",name:cfg.projectStem+" Adoption & Access Survey",type:"Quantitative survey",method:"12-minute online survey",sample:samples[4],audience:cfg.personas.slice(0,5),period:pmrProjectDate(4),markets:cfg.regions.slice(0,4),purpose:"Quantify adoption, barriers, triggers, access constraints and future intent."},
    {id:"experience-survey",name:cfg.projectStem+" Product / Service Experience Benchmark",type:"Quantitative benchmark survey",method:"15-minute online survey",sample:samples[5],audience:cfg.personas,period:pmrProjectDate(5),markets:cfg.regions.slice(0,4),purpose:"Benchmark satisfaction, performance, workflow fit, service experience and advocacy."},
    {id:"decision-survey",name:cfg.projectStem+" Decision Drivers & Readiness Survey",type:"Quantitative decision-driver survey",method:"10-minute online survey + open end",sample:samples[6],audience:cfg.personas.slice(0,5),period:pmrProjectDate(6),markets:cfg.regions.slice(0,4),purpose:"Identify drivers of preference, readiness and priority improvement opportunities."}
  ];

  const themes=cfg.themes.map((theme,i)=>({
    theme,
    frequency:pmrClamp(54+(pmrHash(domain+theme+"f")%41)),
    importance:pmrClamp(68+(pmrHash(domain+theme+"i")%29)),
    satisfaction:pmrClamp(42+(pmrHash(domain+theme+"s")%38)),
    severity:pmrClamp(55+(pmrHash(domain+theme+"v")%39)),
    consensus:pmrClamp(61+(pmrHash(domain+theme+"c")%34)),
    momentum:pmrClamp(48+(pmrHash(domain+theme+"m")%46))
  }));

  const personaMetrics=cfg.personas.map((persona,pi)=>({
    persona,
    interviews:8+(pmrHash(domain+persona+"n")%15),
    satisfaction:pmrClamp(48+(pmrHash(domain+persona+"sat")%37)),
    unmet:pmrClamp(55+(pmrHash(domain+persona+"unmet")%39)),
    adoption:pmrClamp(49+(pmrHash(domain+persona+"adopt")%44)),
    digitalReadiness:pmrClamp(46+(pmrHash(domain+persona+"digital")%48))
  }));

  const expertMetrics=cfg.expertTypes.map((persona,pi)=>({
    persona,
    interviews:3+(pmrHash(domain+persona+"e")%5),
    innovation:pmrClamp(66+(pmrHash(domain+persona+"inn")%31)),
    evidence:pmrClamp(63+(pmrHash(domain+persona+"evi")%34)),
    access:pmrClamp(50+(pmrHash(domain+persona+"acc")%42)),
    disruption:pmrClamp(55+(pmrHash(domain+persona+"dis")%40))
  }));

  const surveyQuestions=cfg.themes.map((theme,i)=>({
    id:"Q"+(i+1),
    label:theme,
    mean:+(3.1+(pmrHash(domain+theme+"mean")%17)/10).toFixed(1),
    top2:pmrClamp(48+(pmrHash(domain+theme+"top")%47)),
    importance:themes[i].importance,
    satisfaction:themes[i].satisfaction,
    driver:+(0.12+(pmrHash(domain+theme+"drv")%43)/100).toFixed(2),
    sig:(pmrHash(domain+theme+"sig")%4)===0?"p<0.01":(pmrHash(domain+theme+"sig")%3)===0?"p<0.05":"ns"
  }));

  const quotes=cfg.quoteSeeds.map((q,i)=>({
    id:"V"+(i+1),persona:q[0],quote:q[1],theme:cfg.themes[(i*2)%cfg.themes.length],
    setting:cfg.settings[i%cfg.settings.length],region:cfg.regions[i%cfg.regions.length],
    salience:["High","High","Medium","High"][i%4]
  }));

  const recommendations=cfg.recommendations.map((text,i)=>({
    priority:i<2?"High":i<4?"Medium":"Watch",
    horizon:i<2?"0–6 months":i<4?"6–18 months":"18+ months",
    text,
    evidence:pmrClamp(66+(pmrHash(domain+text+"ev")%30)),
    feasibility:pmrClamp(58+(pmrHash(domain+text+"feas")%36))
  }));

  window.PMR_DEMO_DATA[domain]={
    config:cfg,
    projects,
    themes,
    personaMetrics,
    expertMetrics,
    surveyQuestions,
    quotes,
    recommendations,
    fieldwork:{
      totalQual:projects.slice(0,4).reduce((a,p)=>a+p.sample,0),
      totalQuant:projects.slice(4).reduce((a,p)=>a+p.sample,0),
      markets:cfg.regions.length,
      completed:"2026 Q3",
      qualityPass:95+(pmrHash(domain+"quality")%4)
    }
  };
});