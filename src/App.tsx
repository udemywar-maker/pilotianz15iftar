import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Calendar, Users, Utensils, Wallet, Moon, Sun, Edit2, Save, X, Lock, Plus, Trash2, Copy, Check, Share2, ThumbsUp } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      providerInfo: []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  // Countdown State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-03-18T18:10:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const syncToFirestore = async (dataToUpdate: any) => {
    try {
      await setDoc(doc(db, 'data', 'main'), dataToUpdate, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'data/main');
    }
  };

  // RSVP State
  const [rsvps, setRsvps] = useState([
    { id: 1, name: 'রাহিম', status: 'going' },
    { id: 2, name: 'করিম', status: 'going' },
    { id: 3, name: 'ফাহিম', status: 'maybe' },
  ]);
  const [isEditingRsvp, setIsEditingRsvp] = useState(false);
  const [selectedRsvps, setSelectedRsvps] = useState<number[]>([]);
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  const handleBulkAdd = () => {
    const names = bulkInput
      .replace(/[0-9০-৯]+[\.\)]/g, ',') // Replace numbers like 1. or ১. with comma
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length > 0) {
      const newRsvps = names.map((name, index) => ({
        id: Date.now() + index,
        name: name,
        status: 'going'
      }));
      setRsvps([...rsvps, ...newRsvps]);
      setBulkInput('');
      setShowBulkInput(false);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    setRsvps(rsvps.map(r => selectedRsvps.includes(r.id) ? { ...r, status } : r));
    setSelectedRsvps([]);
  };

  const handleBulkDelete = () => {
    setRsvps(rsvps.filter(r => !selectedRsvps.includes(r.id)));
    setSelectedRsvps([]);
  };

  const toggleSelectAll = () => {
    if (selectedRsvps.length === rsvps.length && rsvps.length > 0) {
      setSelectedRsvps([]);
    } else {
      setSelectedRsvps(rsvps.map(r => r.id));
    }
  };

  const toggleSelectRsvp = (id: number) => {
    if (selectedRsvps.includes(id)) {
      setSelectedRsvps(selectedRsvps.filter(rId => rId !== id));
    } else {
      setSelectedRsvps([...selectedRsvps, id]);
    }
  };

  const isDuplicateName = (name: string, id: number) => {
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) return false;
    return rsvps.some(r => r.id !== id && r.name.trim().toLowerCase() === trimmedName);
  };

  // Menu State
  const [menuItems, setMenuItems] = useState([
    { id: 1, item: 'ছোলা ও মুড়ি', isDone: true },
    { id: 2, item: 'পেঁয়াজু ও বেগুনি', isDone: true },
    { id: 3, item: 'জিলাপি ও খেজুর', isDone: true },
    { id: 4, item: 'শরবত ও পানি', isDone: false },
  ]);
  const [proposedMenuItems, setProposedMenuItems] = useState<{id: number, item: string, votes: number}[]>([]);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [newProposedItem, setNewProposedItem] = useState('');
  const [votedItems, setVotedItems] = useState<number[]>(() => {
    const saved = localStorage.getItem('votedItems');
    return saved ? JSON.parse(saved) : [];
  });

  // Chanda State
  const [chanda, setChanda] = useState({
    target: 5000,
    collected: 3000,
    perPerson: 300,
    accounts: [
      { id: 1, name: 'Shahad Israq', methods: 'Bkash/Nagad/Rocket', number: '01834983888', type: 'Send Money' },
      { id: 2, name: 'Alamin Hossain', methods: 'Bkash/Nagad/Rocket', number: '01707723744', type: 'Send Money' },
      { id: 3, name: 'Touhid Al Masum', methods: 'Nagad', number: '01718257197', type: 'Send Money' },
      { id: 4, name: 'Hossain Sojib', methods: 'Bkash/Nagad/Rocket', number: '01791825323', type: 'Send Money' }
    ]
  });
  const [isEditingChanda, setIsEditingChanda] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Event Details State
  const [eventDetails, setEventDetails] = useState({
    date: '২৮ রমজান, ১৮ মার্চ ২০২৬, রোজ বুধবার',
    time: 'ইফতারের সময়',
    location: 'নির্ধারিত হয়নি'
  });
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [eventDraft, setEventDraft] = useState(eventDetails);

  const isEditingRef = useRef({ rsvp: false, menu: false, chanda: false, event: false });
  
  useEffect(() => {
    isEditingRef.current = { rsvp: isEditingRsvp, menu: isEditingMenu, chanda: isEditingChanda, event: isEditingEvent };
  }, [isEditingRsvp, isEditingMenu, isEditingChanda, isEditingEvent]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'data', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!isEditingRef.current.rsvp && data.rsvps) setRsvps(data.rsvps);
        if (!isEditingRef.current.menu && data.menuItems) setMenuItems(data.menuItems);
        if (!isEditingRef.current.menu && data.proposedMenuItems) setProposedMenuItems(data.proposedMenuItems);
        if (!isEditingRef.current.chanda && data.chanda) setChanda(data.chanda);
        if (!isEditingRef.current.event && data.eventDetails) {
          setEventDetails(data.eventDetails);
          setEventDraft(data.eventDetails);
        }
      } else {
        syncToFirestore({
          rsvps,
          menuItems,
          proposedMenuItems,
          chanda,
          eventDetails
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'data/main');
    });
    return () => unsub();
  }, []);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [editTargetSection, setEditTargetSection] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const openPasswordModal = (section: string) => {
    setEditTargetSection(section);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '123') {
      if (editTargetSection === 'event') {
        setIsEditingEvent(true);
        setEventDraft(eventDetails);
      } else if (editTargetSection === 'rsvp') {
        setIsEditingRsvp(true);
      } else if (editTargetSection === 'menu') {
        setIsEditingMenu(true);
      } else if (editTargetSection === 'chanda') {
        setIsEditingChanda(true);
      }
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('ভুল পাসওয়ার্ড! (Incorrect password)');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const [isShared, setIsShared] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleProposeItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposedItem.trim()) return;
    
    const newItem = {
      id: Date.now(),
      item: newProposedItem.trim(),
      votes: 1
    };
    
    const newProposedItems = [...proposedMenuItems, newItem];
    setProposedMenuItems(newProposedItems);
    
    const newVotedItems = [...votedItems, newItem.id];
    setVotedItems(newVotedItems);
    localStorage.setItem('votedItems', JSON.stringify(newVotedItems));
    
    setNewProposedItem('');
    syncToFirestore({ proposedMenuItems: newProposedItems });
  };

  const handleVote = (id: number) => {
    let newVotedItems;
    let newProposedItems;
    
    if (votedItems.includes(id)) {
      newVotedItems = votedItems.filter(v => v !== id);
      newProposedItems = proposedMenuItems.map(item => 
        item.id === id ? { ...item, votes: Math.max(0, item.votes - 1) } : item
      );
    } else {
      newVotedItems = [...votedItems, id];
      newProposedItems = proposedMenuItems.map(item => 
        item.id === id ? { ...item, votes: item.votes + 1 } : item
      );
    }
    
    setVotedItems(newVotedItems);
    localStorage.setItem('votedItems', JSON.stringify(newVotedItems));
    setProposedMenuItems(newProposedItems);
    syncToFirestore({ proposedMenuItems: newProposedItems });
  };

  const moveToOfficialMenu = (item: {id: number, item: string, votes: number}) => {
    const newMenuItems = [...menuItems, { id: Date.now(), item: item.item, isDone: false }];
    const newProposedItems = proposedMenuItems.filter(p => p.id !== item.id);
    
    setMenuItems(newMenuItems);
    setProposedMenuItems(newProposedItems);
    syncToFirestore({ menuItems: newMenuItems, proposedMenuItems: newProposedItems });
  };

  const deleteProposedItem = (id: number) => {
    const newProposedItems = proposedMenuItems.filter(p => p.id !== id);
    setProposedMenuItems(newProposedItems);
    syncToFirestore({ proposedMenuItems: newProposedItems });
  };

  const handleShare = async () => {
    const shareData = {
      title: '২০১৫ ব্যাচ এর ইফতার মাহফিল',
      text: 'আগামী ২৮ রমজান, ১৮ মার্চ ২০২৬, রোজ বুধবার ২০১৫ ব্যাচ এর ইফতার মাহফিল অনুষ্ঠিত হবে। বিস্তারিত জানতে লিংকে ক্লিক করুন।',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="pt-16 pb-12 px-4 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleTheme}
            className="p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-full text-amber-400 transition-colors shadow-lg backdrop-blur-sm"
            title={isDarkMode ? "লাইট মোড" : "ডার্ক মোড"}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center mb-6">
          <Moon className="w-14 h-14 text-amber-400" />
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl sm:text-4xl md:text-6xl font-bold text-amber-400 mb-4 tracking-tight">
          ২০১৫ ব্যাচ এর ইফতার মাহফিল
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} transition={{ delay: 0.1 }} animate={{ y: 0, opacity: 1 }} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6">
          আসসালামুয়ালাইকুম, অধিকাংশ জনের মতামতের ভিত্তিতে আগামী ২৮ রমজান, ১৮ মার্চ ২০২৬, রোজ বুধবার ২০১৫ ব্যাচ এর ইফতার মাহফিল অনুষ্ঠিত হবে ইনশাআল্লাহ। সবদিক বিবেচনা করে উক্ত মাহফিলে প্রতিজনের জন্য চাঁদা বাবদ <span className="text-amber-400 font-semibold">{chanda.perPerson} টাকা</span> নির্ধারণ করা হয়েছে।
        </motion.p>
        <motion.div initial={{ y: 20, opacity: 0 }} transition={{ delay: 0.2 }} animate={{ y: 0, opacity: 1 }} className="max-w-3xl mx-auto bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 md:p-6 text-slate-300 text-base md:text-lg leading-relaxed shadow-lg backdrop-blur-sm mb-8">
          অংশগ্রহণে কয়েকজনের সমস্যা থাকা সত্ত্বেও উক্ত সময়ে মাহফিল সম্পন্ন করার সিদ্ধান্ত গ্রহণ করা হয়েছে। এর জন্য দুঃখ প্রকাশ করছি। দৈনন্দিন ব্যস্ততা এবং জীবিকার জন্য আগের মত আমরা এখন আর মিলিত হতে পারি না। একমাত্র ইফতার মাহফিল যেখানে বছরে একবার সবাই সবার সাথে দেখা করার সুযোগ পাই। তাই আশা করি দৈনন্দিন ব্যস্ততা ও সমস্যা উপেক্ষা করে এরকম একটি অনুষ্ঠানে অংশগ্রহণ করার চেষ্টা করব। ইনশাআল্লাহ।
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} transition={{ delay: 0.25 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <p className="text-xl md:text-2xl font-medium text-amber-400 mb-4">আর মাত্র</p>
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-4">
            <div className="flex flex-col items-center p-2 sm:p-3 md:p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl min-w-[65px] sm:min-w-[70px] md:min-w-[90px] shadow-lg">
              <span className="text-xl sm:text-2xl md:text-4xl font-bold text-amber-400 font-mono">{timeLeft.days.toString().padStart(2, '0')}</span>
              <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mt-1">দিন</span>
            </div>
            <div className="flex flex-col items-center p-2 sm:p-3 md:p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl min-w-[65px] sm:min-w-[70px] md:min-w-[90px] shadow-lg">
              <span className="text-xl sm:text-2xl md:text-4xl font-bold text-amber-400 font-mono">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mt-1">ঘণ্টা</span>
            </div>
            <div className="flex flex-col items-center p-2 sm:p-3 md:p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl min-w-[65px] sm:min-w-[70px] md:min-w-[90px] shadow-lg">
              <span className="text-xl sm:text-2xl md:text-4xl font-bold text-amber-400 font-mono">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mt-1">মিনিট</span>
            </div>
            <div className="flex flex-col items-center p-2 sm:p-3 md:p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl min-w-[65px] sm:min-w-[70px] md:min-w-[90px] shadow-lg">
              <span className="text-xl sm:text-2xl md:text-4xl font-bold text-amber-400 font-mono">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mt-1">সেকেন্ড</span>
            </div>
          </div>
          <p className="text-xl md:text-2xl font-medium text-amber-400">বাকি আছে।</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} transition={{ delay: 0.3 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center">
          <button 
            onClick={handleShare} 
            className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-amber-500/5"
          >
            {isShared ? (
              <><Check className="w-5 h-5 text-emerald-400" /> <span className="text-emerald-400">লিংক কপি হয়েছে!</span></>
            ) : (
              <><Share2 className="w-5 h-5" /> ইভেন্ট শেয়ার করুন</>
            )}
          </button>
        </motion.div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-20 space-y-8">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Event Details Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }} 
            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative shadow-xl hover:border-slate-700/50 transition-colors"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-amber-400 flex items-center gap-3">
                <Calendar className="w-6 h-6" /> ইভেন্ট ডিটেইলস
              </h2>
              {!isEditingEvent ? (
                <button onClick={() => openPasswordModal('event')} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-full transition-colors" title="Edit Event">
                  <Edit2 className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingEvent(false)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-full transition-colors" title="Cancel">
                    <X className="w-5 h-5" />
                  </button>
                  <button onClick={() => { 
                    setEventDetails(eventDraft); 
                    setIsEditingEvent(false); 
                    syncToFirestore({ eventDetails: eventDraft });
                  }} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors" title="Save">
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800/80 rounded-2xl text-amber-400"><Clock className="w-6 h-6" /></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-200 text-lg">সময়</p>
                  {isEditingEvent ? (
                    <div className="space-y-2 mt-2">
                      <input type="text" value={eventDraft.date} onChange={e => setEventDraft({...eventDraft, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500" placeholder="তারিখ" />
                      <input type="text" value={eventDraft.time} onChange={e => setEventDraft({...eventDraft, time: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500" placeholder="সময়" />
                    </div>
                  ) : (
                    <p className="text-slate-400">{eventDetails.date} • {eventDetails.time}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800/80 rounded-2xl text-amber-400"><MapPin className="w-6 h-6" /></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-200 text-lg">স্থান</p>
                  {isEditingEvent ? (
                    <input type="text" value={eventDraft.location} onChange={e => setEventDraft({...eventDraft, location: e.target.value})} className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500" placeholder="স্থান" />
                  ) : (
                    <p className="text-slate-400">{eventDetails.location}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RSVP Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }} 
            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm flex flex-col relative shadow-xl hover:border-slate-700/50 transition-colors"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-amber-400 flex items-center gap-2 md:gap-3 flex-wrap">
                <Users className="w-6 h-6" /> কে কে আসছে?
                <span className="text-sm bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-medium border border-emerald-500/20 ml-1 md:ml-2">
                  {rsvps.filter(r => r.status === 'going').length} জন আসবে
                </span>
              </h2>
              {!isEditingRsvp ? (
                <button onClick={() => openPasswordModal('rsvp')} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-full transition-colors" title="Edit RSVP">
                  <Edit2 className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={() => { 
                  setIsEditingRsvp(false); 
                  setSelectedRsvps([]); 
                  syncToFirestore({ rsvps });
                }} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors" title="Done">
                  <Save className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="space-y-3 mb-8 flex-grow">
              {isEditingRsvp && rsvps.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 mb-4">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedRsvps.length === rsvps.length && rsvps.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-sm font-medium">সব নির্বাচন করুন</span>
                  </label>
                  
                  {selectedRsvps.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBulkStatusChange(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">স্ট্যাটাস পরিবর্তন...</option>
                        <option value="going">আসবে</option>
                        <option value="maybe">নিশ্চিত নয়</option>
                      </select>
                      <button 
                        onClick={handleBulkDelete}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> মুছুন ({selectedRsvps.length})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30 gap-3 sm:gap-0">
                  {isEditingRsvp ? (
                    <div className="w-full">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
                        <input 
                          type="checkbox" 
                          checked={selectedRsvps.includes(rsvp.id)}
                          onChange={() => toggleSelectRsvp(rsvp.id)}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer shrink-0"
                        />
                        <input type="text" value={rsvp.name} onChange={(e) => setRsvps(rsvps.map(r => r.id === rsvp.id ? {...r, name: e.target.value} : r))} className={`bg-slate-800 border ${isDuplicateName(rsvp.name, rsvp.id) ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'} rounded-lg px-2 py-1 text-slate-200 flex-1 min-w-[120px] focus:outline-none`} />
                        <select value={rsvp.status} onChange={(e) => setRsvps(rsvps.map(r => r.id === rsvp.id ? {...r, status: e.target.value} : r))} className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 w-auto sm:w-28 focus:outline-none focus:border-amber-500">
                          <option value="going">আসবে</option>
                          <option value="maybe">নিশ্চিত নয়</option>
                        </select>
                        <button onClick={() => setRsvps(rsvps.filter(r => r.id !== rsvp.id))} className="text-red-400 hover:text-red-300 p-1 shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      {isDuplicateName(rsvp.name, rsvp.id) && (
                        <p className="text-red-400 text-xs mt-2 ml-7">এই নামটি ইতিমধ্যে তালিকায় আছে!</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-base sm:text-lg break-words flex-1 pr-2">{rsvp.name}</span>
                      <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium shrink-0 ${rsvp.status === 'going' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {rsvp.status === 'going' ? 'আসবে' : 'নিশ্চিত নয়'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              {isEditingRsvp && (
                <div className="mt-4">
                  {showBulkInput ? (
                    <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                      <textarea
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder="নামগুলো লিখুন (যেমন: ১. হাসান ২. শাহাদ ৩. হৃদয় অথবা কমা দিয়ে)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 min-h-[100px] mb-3"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowBulkInput(false)} className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors">বাতিল</button>
                        <button onClick={handleBulkAdd} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition-colors">যোগ করুন</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setRsvps([...rsvps, { id: Date.now(), name: 'নতুন অতিথি', status: 'going' }])} className="flex-1 flex items-center justify-center gap-2 text-amber-400 hover:bg-amber-500/10 py-3 rounded-xl border border-amber-500/30 border-dashed transition-colors">
                        <Plus className="w-5 h-5" /> একজন যোগ করুন
                      </button>
                      <button onClick={() => setShowBulkInput(true)} className="flex-1 flex items-center justify-center gap-2 text-emerald-400 hover:bg-emerald-500/10 py-3 rounded-xl border border-emerald-500/30 border-dashed transition-colors">
                        <Users className="w-5 h-5" /> একসাথে অনেক নাম
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Food Menu Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }} 
            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative shadow-xl hover:border-slate-700/50 transition-colors"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-amber-400 flex items-center gap-3">
                <Utensils className="w-6 h-6" /> ইফতার মেন্যু
              </h2>
              {!isEditingMenu ? (
                <button onClick={() => openPasswordModal('menu')} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-full transition-colors" title="Edit Menu">
                  <Edit2 className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={() => {
                  setIsEditingMenu(false);
                  syncToFirestore({ menuItems });
                }} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors" title="Done">
                  <Save className="w-5 h-5" />
                </button>
              )}
            </div>
            <ul className="space-y-4 text-slate-300">
              {menuItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-2xl hover:bg-slate-800/30 transition-colors">
                  {isEditingMenu ? (
                    <div className="flex items-center gap-2 w-full">
                      <input type="checkbox" checked={item.isDone} onChange={(e) => setMenuItems(menuItems.map(m => m.id === item.id ? {...m, isDone: e.target.checked} : m))} className="w-4 h-4 accent-amber-500 shrink-0" />
                      <input type="text" value={item.item} onChange={(e) => setMenuItems(menuItems.map(m => m.id === item.id ? {...m, item: e.target.value} : m))} className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 flex-1 min-w-0" placeholder="খাবারের নাম" />
                      <button onClick={() => setMenuItems(menuItems.filter(m => m.id !== item.id))} className="text-red-400 hover:text-red-300 p-1 shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <div className={`w-3 h-3 rounded-full shrink-0 ${item.isDone ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-600'}`} /> 
                      <span className={`text-base sm:text-lg break-words ${!item.isDone && 'text-slate-400'}`}>{item.item}</span>
                    </>
                  )}
                </li>
              ))}
              {isEditingMenu && (
                <li className="flex items-center gap-2 p-3 rounded-2xl border border-slate-700 border-dashed mt-2">
                  <button onClick={() => setMenuItems([...menuItems, { id: Date.now(), item: 'নতুন খাবার', isDone: false }])} className="w-full flex items-center justify-center gap-2 text-amber-400 hover:text-amber-300 py-1">
                    <Plus className="w-5 h-5" /> নতুন খাবার যোগ করুন
                  </button>
                </li>
              )}
            </ul>
          </motion.div>

          {/* Proposed Menu Items Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.35 }}
            className="bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 dark:border-slate-800 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-amber-400 flex items-center gap-3">
                <Utensils className="w-6 h-6" /> প্রস্তাবিত মেন্যু
              </h2>
            </div>
            
            <ul className="space-y-3 text-slate-300 mb-6">
              {proposedMenuItems.sort((a, b) => b.votes - a.votes).map((item) => {
                const hasVoted = votedItems.includes(item.id);
                return (
                  <li key={item.id} className="flex items-center justify-between gap-2 p-3 bg-slate-800/40 dark:bg-slate-800/40 rounded-2xl border border-slate-700/30">
                    <span className="text-base sm:text-lg break-words flex-1">{item.item}</span>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <button 
                        onClick={() => handleVote(item.id)}
                        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                          hasVoted 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-amber-400' : ''}`} /> {item.votes}
                      </button>
                      
                      {isEditingMenu && (
                        <div className="flex items-center gap-1 ml-2 border-l border-slate-700 pl-3">
                          <button 
                            onClick={() => moveToOfficialMenu(item)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-full transition-colors"
                            title="মূল মেন্যুতে যোগ করুন"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteProposedItem(item.id)}
                            className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
              {proposedMenuItems.length === 0 && (
                <p className="text-center text-slate-500 py-4">কোনো প্রস্তাবিত খাবার নেই</p>
              )}
            </ul>

            <form onSubmit={handleProposeItem} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newProposedItem}
                onChange={(e) => setNewProposedItem(e.target.value)}
                placeholder="নতুন খাবারের প্রস্তাব দিন..."
                className="flex-1 bg-slate-800/60 dark:bg-slate-800/60 border border-slate-700 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-500"
              />
              <button 
                type="submit"
                disabled={!newProposedItem.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 dark:text-slate-950 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-5 h-5" /> প্রস্তাব
              </button>
            </form>
          </motion.div>

          {/* Chanda Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }} 
            className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative shadow-xl hover:border-slate-700/50 transition-colors"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-amber-400 flex items-center gap-3">
                <Wallet className="w-6 h-6" /> চাঁদা কালেকশন
              </h2>
              {!isEditingChanda ? (
                <button onClick={() => openPasswordModal('chanda')} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-full transition-colors" title="Edit Chanda">
                  <Edit2 className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={() => {
                  setIsEditingChanda(false);
                  syncToFirestore({ chanda });
                }} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors" title="Done">
                  <Save className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="mb-8 p-5 bg-slate-800/30 rounded-2xl border border-slate-700/30">
              {isEditingChanda ? (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-slate-400 text-sm">মোট টার্গেট (৳):</label>
                    <input type="number" value={chanda.target} onChange={(e) => setChanda({...chanda, target: Number(e.target.value)})} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-slate-200 w-32 text-right" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-slate-400 text-sm">উঠেছে (৳):</label>
                    <input type="number" value={chanda.collected} onChange={(e) => setChanda({...chanda, collected: Number(e.target.value)})} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-slate-200 w-32 text-right" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-slate-400 text-sm">জনপ্রতি চাঁদা (৳):</label>
                    <input type="number" value={chanda.perPerson} onChange={(e) => setChanda({...chanda, perPerson: Number(e.target.value)})} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-slate-200 w-32 text-right" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-end text-sm mb-3">
                  <span className="text-slate-400 text-base">মোট টার্গেট: {chanda.target} ৳</span>
                  <div className="text-right">
                    <span className="text-amber-400 font-medium text-base block">উঠেছে: {chanda.collected} ৳</span>
                  </div>
                </div>
              )}
              <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full relative transition-all duration-500 flex items-center justify-end pr-2" 
                  style={{ width: `${Math.min(100, (chanda.collected / chanda.target) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                  {((chanda.collected / chanda.target) * 100) > 8 && (
                    <span className="text-[10px] font-bold text-amber-950 relative z-10">
                      {Math.round((chanda.collected / chanda.target) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-slate-300 mb-4">Payment Methods:</h3>
              {chanda.accounts.map((acc) => (
                <div key={acc.id} className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium mb-1">{acc.id}. {acc.name} <span className="text-slate-400 text-sm font-normal">({acc.methods})</span></p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-mono text-amber-400 tracking-wider">{acc.number}</p>
                      <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-md">{acc.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCopy(acc.id, acc.number)} 
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    {copiedId === acc.id ? <><Check className="w-4 h-4 text-emerald-400" /> কপি হয়েছে</> : <><Copy className="w-4 h-4" /> কপি করুন</>}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </main>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={isShaking ? { x: [-10, 10, -10, 10, 0], scale: 1, opacity: 1, y: 0 } : { scale: 1, opacity: 1, y: 0, x: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: isShaking ? 0.4 : 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
                  <Lock className="w-5 h-5" /> পাসওয়ার্ড দিন
                </h3>
                <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordInput(''); }} className="text-slate-400 hover:text-slate-200 transition-colors rounded-full p-1 hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="পাসওয়ার্ড"
                  className={`w-full bg-slate-800 border ${passwordError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-700 focus:border-amber-500'} rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors mb-2`}
                  autoFocus
                />
                <AnimatePresence>
                  {passwordError && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }} 
                      className="text-red-400 text-sm mb-4"
                    >
                      {passwordError}
                    </motion.p>
                  )}
                </AnimatePresence>
                <button type="submit" className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20">
                  সাবমিট
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-800/50 mt-12">
        <p className="text-slate-400 text-sm">© 2026 Ashraf Ul Islam. All Rights Reserved.</p>
        <p className="text-slate-500 text-xs mt-1">Designed for Innovation & Precision</p>
      </footer>
    </div>
  );
}
