import type { Node, Edge } from "@xyflow/react";
import type { MusicAsset, GameProject } from "./projects";

// ═══════════════════════════════════════════════════════════════════════════════
// CALL OF DUTY: WARFARE ZONEOPS 12.4
// ═══════════════════════════════════════════════════════════════════════════════

const codAssets_firebase: MusicAsset[] = [
  { id: "cod-fb-01", filename: "mus_firebase_insertion_intro", category: "intro", duration: "0:18", bpm: 140, key: "Dm", stems: ["brass_march_heroic", "perc_helo_rotor_sync", "synth_radio_chatter_bed"], audioFile: "journey2/mus_journey2_cinematic_suite.mp3" },
  { id: "cod-fb-02", filename: "mus_firebase_patrol_loop", category: "loop", duration: "2:24", bpm: 140, key: "Dm", stems: ["brass_march_heroic", "perc_boots_cadence", "guitar_tension_palm_mute", "synth_uav_ping_rhythm"], audioFile: "journey2/mus_sunset_golden_apocalypse_explore.mp3" },
  { id: "cod-fb-03", filename: "mus_firebase_stealth_insert_loop", category: "loop", duration: "1:48", bpm: 140, key: "Dm", stems: ["pad_nvg_hum", "perc_heartbeat_monitor", "synth_radio_chatter_bed"], audioFile: "bloodborne2/mus_nightmare_bad_dream_explore.mp3" },
  { id: "cod-fb-04", filename: "mus_firebase_contact_combat_lo", category: "loop", duration: "1:12", bpm: 160, key: "Dm", stems: ["brass_march_heroic", "perc_snare_military", "guitar_distortion_riff", "synth_killstreak_rising"], audioFile: "journey2/mus_summit_companion_carnage_combat.mp3" },
  { id: "cod-fb-05", filename: "mus_firebase_danger_close_combat_hi", category: "loop", duration: "1:12", bpm: 160, key: "Dm", stems: ["brass_full_section_blare", "perc_taiko_airstrike", "guitar_distortion_riff", "choir_operator_chant", "synth_missile_lock_tone"], audioFile: "journey2/mus_journey2_boss_theme.mp3" },
  { id: "cod-fb-06", filename: "mus_firebase_trans_stealth_to_contact", category: "transition", duration: "0:03", bpm: 160, key: "Dm", stems: ["perc_flashbang_hit", "brass_stab"], audioFile: "transition_sweep.mp3" },
  { id: "cod-fb-07", filename: "mus_firebase_trans_contact_to_patrol", category: "transition", duration: "0:05", bpm: 140, key: "Dm", stems: ["synth_radio_all_clear", "pad_nvg_hum"], audioFile: "transition_sweep.mp3" },
  { id: "cod-fb-08", filename: "mus_firebase_stinger_killstreak", category: "stinger", duration: "0:03", bpm: 160, key: "Dm", stems: ["brass_fanfare_short", "perc_snare_roll"], audioFile: "journey2/stinger_chapter_complete.mp3" },
  { id: "cod-fb-09", filename: "mus_firebase_stinger_team_wipe", category: "stinger", duration: "0:02", bpm: 140, key: "Dm", stems: ["synth_defeat_drone", "perc_impact_reverb"], audioFile: "bloodborne2/stinger_you_died_meow.mp3" },
  { id: "cod-fb-10", filename: "mus_firebase_exfil_victory", category: "ending", duration: "0:22", bpm: 140, key: "Dm", stems: ["brass_march_heroic", "choir_operator_chant", "perc_boots_cadence"], audioFile: "journey2/mus_sands_gentle_hugs_explore.mp3" },
  { id: "cod-fb-11", filename: "mus_firebase_ambient_radio_static", category: "ambient", duration: "4:00", bpm: 0, key: "-", stems: ["static_encrypted_comms", "wind_rooftop_distant"], audioFile: "journey2/mus_brook_carnage_creek_ambient.mp3" },
];

const codNodes_firebase: Node[] = [
  { id: "cod-fb-intro", type: "musicState", position: { x: 96, y: 390 }, data: { label: "Insertion", intensity: 20, looping: false, stems: ["brass_march_heroic", "perc_helo_rotor_sync", "synth_radio_chatter_bed"], asset: "mus_firebase_insertion_intro", directorNote: "Helicopter insertion. The 47th helicopter insertion in the franchise. Marketing says each one must feel MORE iconic than the last. The brass should convey both patriotism and the $400M development budget.", status: "final", jiraTicket: "COD-2401" } },
  { id: "cod-fb-patrol", type: "musicState", position: { x: 544, y: 210 }, data: { label: "Firebase Patrol", intensity: 35, looping: true, stems: ["brass_march_heroic", "perc_boots_cadence", "guitar_tension_palm_mute", "synth_uav_ping_rhythm"], asset: "mus_firebase_patrol_loop", directorNote: "Standard patrol. We need it to feel exactly like the last 11.4 games but also completely fresh and innovative. The UAV ping rhythm is now intellectual property. Legal has confirmed.", status: "final" } },
  { id: "cod-fb-stealth", type: "musicState", position: { x: 544, y: 570 }, data: { label: "Stealth Insert", intensity: 15, looping: true, stems: ["pad_nvg_hum", "perc_heartbeat_monitor", "synth_radio_chatter_bed"], asset: "mus_firebase_stealth_insert_loop", directorNote: "Stealth section that 97% of players will immediately abandon by firing an RPG at the first enemy they see. Still, the 3% deserve a properly tense score. The heartbeat monitor stem is literal — it's a Fitbit recording from the lead designer during his performance review.", status: "approved", jiraTicket: "COD-2403" } },
  { id: "cod-fb-trans-combat", type: "transition", position: { x: 992, y: 180 }, data: { label: "→ Contact!", duration: 3000, syncPoint: "next-bar", fadeType: "sting", status: "final" } },
  { id: "cod-fb-combat-lo", type: "musicState", position: { x: 1408, y: 120 }, data: { label: "Contact", intensity: 70, looping: true, stems: ["brass_march_heroic", "perc_snare_military", "guitar_distortion_riff", "synth_killstreak_rising"], asset: "mus_firebase_contact_combat_lo", status: "final" } },
  { id: "cod-fb-combat-hi", type: "musicState", position: { x: 1408, y: 420 }, data: { label: "Danger Close", intensity: 95, looping: true, stems: ["brass_full_section_blare", "perc_taiko_airstrike", "guitar_distortion_riff", "choir_operator_chant", "synth_missile_lock_tone"], asset: "mus_firebase_danger_close_combat_hi", directorNote: "This is where the $2M orchestra budget really shines. 80 brass players, 60 strings, a military choir, and Hans Zimmer on speed dial 'just in case.' The missile lock tone should sync to the kill feed. Every three kills, add a French horn. After a MOAB: everything. All the instruments. At once.", status: "approved", jiraTicket: "COD-2406" } },
  { id: "cod-fb-param-threat", type: "parameter", position: { x: 1408, y: 705 }, data: { label: "ThreatLevel", paramName: "RTPC_ThreatLevel", minValue: 0, maxValue: 100, defaultValue: 30, description: "Driven by enemy count, proximity, and killstreak status. At 100, the music has more layers than the player has loadout options. At 0, it's just the wind and distant gunfire from a different match.", status: "final" } },
  { id: "cod-fb-trans-patrol", type: "transition", position: { x: 992, y: 510 }, data: { label: "→ All Clear", duration: 5000, syncPoint: "next-bar", fadeType: "crossfade", status: "final" } },
  { id: "cod-fb-stinger-kill", type: "stinger", position: { x: 544, y: 840 }, data: { label: "Killstreak!", trigger: "OnKillstreak", asset: "mus_firebase_stinger_killstreak", priority: "high", status: "final" } },
  { id: "cod-fb-stinger-wipe", type: "stinger", position: { x: 992, y: 840 }, data: { label: "Team Wipe", trigger: "OnTeamWipe", asset: "mus_firebase_stinger_team_wipe", priority: "critical", status: "approved" } },
  { id: "cod-fb-ending", type: "musicState", position: { x: 1824, y: 390 }, data: { label: "Exfil Victory", intensity: 50, looping: false, stems: ["brass_march_heroic", "choir_operator_chant", "perc_boots_cadence"], asset: "mus_firebase_exfil_victory", status: "final" } },
  { id: "cod-fb-event-briefing", type: "event", position: { x: 96, y: 120 }, data: { label: "Mission Briefing", eventType: "cinematic", blueprintRef: "BP_Cinematic_Briefing_Firebase", description: "A grizzled captain points at a map. The map has exactly one red circle on it. 'We go here,' he says. This is the entire briefing. The map cost $50,000 to model.", status: "final", jiraTicket: "COD-2412" } },
  { id: "cod-fb-event-airstrike", type: "event", position: { x: 1824, y: 80 }, data: { label: "Airstrike Called", eventType: "igc", blueprintRef: "BP_IGC_Airstrike_Firebase", description: "Player calls in an airstrike. The sky goes dark. Three jets fly overhead in formation. Everything explodes. The player's K/D ratio improves by 0.02.", status: "approved" } },
];

const codEdges_firebase: Edge[] = [
  { id: "e-cod-fb-1", source: "cod-fb-intro", target: "cod-fb-patrol", animated: true, label: "Auto" },
  { id: "e-cod-fb-2", source: "cod-fb-intro", target: "cod-fb-stealth", animated: true, label: "NVG equipped", style: { strokeDasharray: "5 5" } },
  { id: "e-cod-fb-3", source: "cod-fb-patrol", target: "cod-fb-trans-combat", animated: true },
  { id: "e-cod-fb-4", source: "cod-fb-stealth", target: "cod-fb-trans-combat", animated: true },
  { id: "e-cod-fb-5", source: "cod-fb-trans-combat", target: "cod-fb-combat-lo", animated: true },
  { id: "e-cod-fb-6", source: "cod-fb-combat-lo", target: "cod-fb-combat-hi", animated: true, label: "Threat > 70", style: { stroke: "#e94560" } },
  { id: "e-cod-fb-7", source: "cod-fb-combat-hi", target: "cod-fb-combat-lo", animated: true, label: "Threat < 40", style: { stroke: "#4ecdc4" } },
  { id: "e-cod-fb-8", source: "cod-fb-combat-lo", target: "cod-fb-trans-patrol", animated: true, label: "Area secure" },
  { id: "e-cod-fb-9", source: "cod-fb-trans-patrol", target: "cod-fb-patrol", animated: true },
  { id: "e-cod-fb-10", source: "cod-fb-combat-hi", target: "cod-fb-ending", animated: true, label: "Mission complete" },
  { id: "e-cod-fb-11", source: "cod-fb-event-briefing", target: "cod-fb-intro", animated: true, label: "Briefing ends", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-cod-fb-12", source: "cod-fb-event-airstrike", target: "cod-fb-combat-hi", animated: true, label: "Bombs away", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-cod-fb-13", source: "cod-fb-ending", target: "cod-fb-event-airstrike", animated: true, label: "Endgame", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

// Level 2: Lobby Simulator
const codAssets_lobby: MusicAsset[] = [
  { id: "cod-lb-01", filename: "mus_lobby_waiting_intro", category: "intro", duration: "0:12", bpm: 120, key: "Em", stems: ["synth_matchmaking_pulse", "pad_server_hum"], audioFile: "bloodborne2/mus_bb2_main_theme_intro.mp3" },
  { id: "cod-lb-02", filename: "mus_lobby_loadout_loop", category: "loop", duration: "1:30", bpm: 120, key: "Em", stems: ["synth_menu_groove", "perc_ui_clicks_rhythmic", "bass_sub_loadout", "pad_camo_selection_shimmer"], audioFile: "bloodborne2/mus_cattower_fancy_feast_waltz.mp3" },
  { id: "cod-lb-03", filename: "mus_lobby_countdown_loop", category: "loop", duration: "0:45", bpm: 140, key: "Em", stems: ["synth_countdown_urgent", "perc_timer_tick", "brass_deployment_rising"], audioFile: "journey2/mus_cloud_fluffy_death_explore.mp3" },
  { id: "cod-lb-04", filename: "mus_lobby_trans_to_countdown", category: "transition", duration: "0:02", bpm: 140, key: "Em", stems: ["synth_match_found_hit"], audioFile: "transition_sweep.mp3" },
  { id: "cod-lb-05", filename: "mus_lobby_stinger_match_found", category: "stinger", duration: "0:02", bpm: 140, key: "Em", stems: ["brass_match_found_fanfare"], audioFile: "journey2/stinger_scarf_levelup.mp3" },
  { id: "cod-lb-06", filename: "mus_lobby_stinger_host_migration", category: "stinger", duration: "0:03", bpm: 120, key: "Em", stems: ["synth_error_descend", "static_connection_lost"], audioFile: "journey2/stinger_companion_death.mp3" },
  { id: "cod-lb-07", filename: "mus_lobby_deploy_ending", category: "ending", duration: "0:08", bpm: 140, key: "Em", stems: ["brass_deployment_rising", "perc_boots_drop", "synth_loading_screen_swell"], audioFile: "journey2/mus_garden_horror_blossom_explore.mp3" },
  { id: "cod-lb-08", filename: "mus_lobby_ambient_server_room", category: "ambient", duration: "4:00", bpm: 0, key: "-", stems: ["drone_server_fan_hum", "click_hard_drive_seek"], audioFile: "bloodborne2/mus_litterbox_ancient_litter_ambient.mp3" },
];

const codNodes_lobby: Node[] = [
  { id: "cod-lb-intro", type: "musicState", position: { x: 96, y: 300 }, data: { label: "Matchmaking", intensity: 10, looping: false, stems: ["synth_matchmaking_pulse", "pad_server_hum"], asset: "mus_lobby_waiting_intro", directorNote: "The player stares at a spinning circle. The music must make this feel like an epic moment of preparation rather than what it actually is: waiting for a server in Boise to respond.", status: "final" } },
  { id: "cod-lb-loadout", type: "musicState", position: { x: 544, y: 200 }, data: { label: "Loadout Selection", intensity: 25, looping: true, stems: ["synth_menu_groove", "perc_ui_clicks_rhythmic", "bass_sub_loadout", "pad_camo_selection_shimmer"], asset: "mus_lobby_loadout_loop", directorNote: "The player will spend 45 minutes here changing attachments that affect gameplay by 0.3%. The camo selection shimmer stem activates when browsing $24 weapon skins. It should sound like money well spent.", status: "approved" } },
  { id: "cod-lb-countdown", type: "musicState", position: { x: 1100, y: 300 }, data: { label: "Deployment Countdown", intensity: 50, looping: true, stems: ["synth_countdown_urgent", "perc_timer_tick", "brass_deployment_rising"], asset: "mus_lobby_countdown_loop", status: "final" } },
  { id: "cod-lb-trans", type: "transition", position: { x: 800, y: 200 }, data: { label: "→ Match Found", duration: 2000, syncPoint: "immediate", fadeType: "sting", status: "final" } },
  { id: "cod-lb-stinger-found", type: "stinger", position: { x: 544, y: 500 }, data: { label: "Match Found!", trigger: "OnMatchFound", asset: "mus_lobby_stinger_match_found", priority: "high", status: "final" } },
  { id: "cod-lb-stinger-migrate", type: "stinger", position: { x: 1100, y: 500 }, data: { label: "Host Migration", trigger: "OnHostMigration", asset: "mus_lobby_stinger_host_migration", priority: "critical", directorNote: "The most feared sound in online gaming. The connection drops. 30 seconds of progress: gone. The stinger should convey loss, betrayal, and a strong urge to switch to a different game.", status: "final" } },
  { id: "cod-lb-ending", type: "musicState", position: { x: 1500, y: 300 }, data: { label: "Deploy!", intensity: 60, looping: false, stems: ["brass_deployment_rising", "perc_boots_drop", "synth_loading_screen_swell"], asset: "mus_lobby_deploy_ending", status: "final" } },
  { id: "cod-lb-event-store", type: "event", position: { x: 96, y: 100 }, data: { label: "Store Visited", eventType: "button_press", blueprintRef: "BP_UI_Store_Open", description: "Player opens the in-game store. The music subtly shifts to encourage purchasing. This is not manipulation. This is 'dynamic audio design.' Legal approved the distinction.", status: "approved" } },
];

const codEdges_lobby: Edge[] = [
  { id: "e-cod-lb-1", source: "cod-lb-intro", target: "cod-lb-loadout", animated: true, label: "Auto" },
  { id: "e-cod-lb-2", source: "cod-lb-loadout", target: "cod-lb-trans", animated: true },
  { id: "e-cod-lb-3", source: "cod-lb-trans", target: "cod-lb-countdown", animated: true },
  { id: "e-cod-lb-4", source: "cod-lb-countdown", target: "cod-lb-ending", animated: true, label: "Timer = 0" },
  { id: "e-cod-lb-5", source: "cod-lb-countdown", target: "cod-lb-intro", animated: true, label: "Host migrated", style: { stroke: "#e94560", strokeDasharray: "5 5" } },
  { id: "e-cod-lb-6", source: "cod-lb-event-store", target: "cod-lb-loadout", animated: true, label: "Store closed", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

export const codProject: GameProject = {
  id: "cod-warfare",
  name: "STRIKECORE: WARZONE OPS 12-4",
  subtitle: "Now With 12.4% More Warfare",
  levels: [
    { id: "cod-firebase", name: "Firebase Assault", subtitle: "Exactly What You Think It Is", region: "Campaign", nodes: codNodes_firebase, edges: codEdges_firebase, assets: codAssets_firebase },
    { id: "cod-lobby", name: "Lobby Simulator", subtitle: "The Real Game", region: "Multiplayer", nodes: codNodes_lobby, edges: codEdges_lobby, assets: codAssets_lobby },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEDITATION RETREAT
// ═══════════════════════════════════════════════════════════════════════════════

const medAssets_garden: MusicAsset[] = [
  { id: "med-gd-01", filename: "mus_garden_arrival_intro", category: "intro", duration: "0:45", bpm: 60, key: "C", stems: ["bells_singing_bowl", "pad_morning_mist", "nature_creek_gentle"], audioFile: "journey2/mus_journey2_main_theme_intro.mp3" },
  { id: "med-gd-02", filename: "mus_garden_walking_meditation_loop", category: "loop", duration: "3:20", bpm: 60, key: "C", stems: ["bells_singing_bowl", "flute_shakuhachi_gentle", "pad_earth_resonance", "nature_birdsong_sparse"], audioFile: "journey2/mus_sands_false_tranquility_loop.mp3" },
  { id: "med-gd-03", filename: "mus_garden_deep_focus_loop", category: "loop", duration: "4:00", bpm: 60, key: "C", stems: ["drone_om_fundamental", "pad_breath_cycle", "bells_distant_temple"], audioFile: "bloodborne2/mus_bb2_hunters_dream_ambient.mp3" },
  { id: "med-gd-04", filename: "mus_garden_anxiety_intrusion_loop", category: "loop", duration: "1:30", bpm: 90, key: "Cm", stems: ["strings_worried_tremolo", "perc_heartbeat_anxious", "synth_phone_notification_abstracted", "pad_deadline_pressure"], audioFile: "journey2/mus_garden_petal_destruction_combat.mp3" },
  { id: "med-gd-05", filename: "mus_garden_trans_peace_to_anxiety", category: "transition", duration: "0:06", bpm: 90, key: "Cm", stems: ["strings_worried_tremolo", "synth_phone_notification_abstracted"], audioFile: "transition_sweep.mp3" },
  { id: "med-gd-06", filename: "mus_garden_trans_anxiety_to_peace", category: "transition", duration: "0:08", bpm: 60, key: "C", stems: ["bells_singing_bowl", "pad_breath_cycle"], audioFile: "transition_sweep.mp3" },
  { id: "med-gd-07", filename: "mus_garden_stinger_breakthrough", category: "stinger", duration: "0:04", bpm: 60, key: "C", stems: ["bells_singing_bowl", "pad_enlightenment_swell"], audioFile: "bloodborne2/stinger_insight_gained.mp3" },
  { id: "med-gd-08", filename: "mus_garden_stinger_phone_buzzed", category: "stinger", duration: "0:02", bpm: 90, key: "Cm", stems: ["synth_phone_buzz_abstracted", "strings_tension_snap"], audioFile: "bloodborne2/stinger_frenzy_building.mp3" },
  { id: "med-gd-09", filename: "mus_garden_sunset_resolution", category: "ending", duration: "0:35", bpm: 60, key: "C", stems: ["bells_singing_bowl", "flute_shakuhachi_gentle", "pad_golden_hour", "nature_evening_crickets"], audioFile: "journey2/mus_brook_peaceful_massacre_explore.mp3" },
  { id: "med-gd-10", filename: "mus_garden_ambient_wind_chimes", category: "ambient", duration: "5:00", bpm: 0, key: "-", stems: ["chimes_bamboo_random", "wind_gentle_garden", "water_fountain_distant"], audioFile: "journey2/mus_garden_zen_annihilation_ambient.mp3" },
];

const medNodes_garden: Node[] = [
  { id: "med-gd-intro", type: "musicState", position: { x: 96, y: 390 }, data: { label: "Garden Arrival", intensity: 5, looping: false, stems: ["bells_singing_bowl", "pad_morning_mist", "nature_creek_gentle"], asset: "mus_garden_arrival_intro", directorNote: "The player arrives at the garden. They have 847 unread emails. The music must make them forget this immediately. The singing bowl hit should resonate for exactly 8 seconds — the average time it takes a game developer to stop thinking about their Jira board.", status: "final" } },
  { id: "med-gd-walking", type: "musicState", position: { x: 544, y: 210 }, data: { label: "Walking Meditation", intensity: 15, looping: true, stems: ["bells_singing_bowl", "flute_shakuhachi_gentle", "pad_earth_resonance", "nature_birdsong_sparse"], asset: "mus_garden_walking_meditation_loop", directorNote: "Each footstep in the garden triggers a subtle tonal shift. The birdsong stem should feel random but is actually algorithmically peaceful. We had three sound designers argue about what 'algorithmically peaceful' means. Two of them now meditate regularly. The third quit game development.", status: "approved" } },
  { id: "med-gd-focus", type: "musicState", position: { x: 544, y: 570 }, data: { label: "Deep Focus", intensity: 8, looping: true, stems: ["drone_om_fundamental", "pad_breath_cycle", "bells_distant_temple"], asset: "mus_garden_deep_focus_loop", directorNote: "The breath cycle stem syncs to the player's actual breathing if they have a smartwatch connected. If not, it assumes 4 seconds in, 7 seconds hold, 8 seconds out. If the player is breathing faster than this, the game gently judges them.", status: "final" } },
  { id: "med-gd-anxiety", type: "musicState", position: { x: 1408, y: 390 }, data: { label: "Anxiety Intrusion", intensity: 55, looping: true, stems: ["strings_worried_tremolo", "perc_heartbeat_anxious", "synth_phone_notification_abstracted", "pad_deadline_pressure"], asset: "mus_garden_anxiety_intrusion_loop", directorNote: "Sometimes peace is interrupted. The phone notification stem is an abstracted version of actual Slack sounds, legally distinct enough to avoid a lawsuit but close enough to trigger genuine cortisol responses in playtesters. QA reported that 4 out of 5 testers instinctively reached for their phones. We consider this a success.", status: "approved", jiraTicket: "MED-104" } },
  { id: "med-gd-trans-anxiety", type: "transition", position: { x: 992, y: 210 }, data: { label: "→ Intrusive Thought", duration: 6000, syncPoint: "next-bar", fadeType: "crossfade", status: "final" } },
  { id: "med-gd-trans-peace", type: "transition", position: { x: 992, y: 570 }, data: { label: "→ Letting Go", duration: 8000, syncPoint: "next-bar", fadeType: "crossfade", directorNote: "8-second crossfade. This is the sound of releasing anxiety. It should feel like the first sip of coffee in the morning, except healthy.", status: "approved" } },
  { id: "med-gd-param-calm", type: "parameter", position: { x: 96, y: 700 }, data: { label: "InnerCalm", paramName: "RTPC_InnerCalm", minValue: 0, maxValue: 100, defaultValue: 50, description: "Driven by gameplay choices: sitting still, breathing exercises, ignoring the phone. At 100, the world literally glows warmer. At 0, the strings section plays what we internally call 'email dread.'", status: "final" } },
  { id: "med-gd-stinger-break", type: "stinger", position: { x: 1408, y: 120 }, data: { label: "Breakthrough!", trigger: "OnBreakthrough", asset: "mus_garden_stinger_breakthrough", priority: "high", status: "final" } },
  { id: "med-gd-stinger-phone", type: "stinger", position: { x: 1408, y: 660 }, data: { label: "Phone Buzzed", trigger: "OnPhoneBuzz", asset: "mus_garden_stinger_phone_buzzed", priority: "low", status: "approved" } },
  { id: "med-gd-ending", type: "musicState", position: { x: 1824, y: 390 }, data: { label: "Sunset Resolution", intensity: 20, looping: false, stems: ["bells_singing_bowl", "flute_shakuhachi_gentle", "pad_golden_hour", "nature_evening_crickets"], asset: "mus_garden_sunset_resolution", status: "final" } },
  { id: "med-gd-event-butterfly", type: "event", position: { x: 96, y: 120 }, data: { label: "Butterfly Lands on Hand", eventType: "igc", blueprintRef: "BP_IGC_Butterfly_Garden", description: "A butterfly lands on the player's hand. The player can choose to observe it or check their phone. This is the central moral choice of the game. There is no wrong answer, but choosing the phone triggers a 15-minute unskippable mindfulness tutorial.", status: "final" } },
];

const medEdges_garden: Edge[] = [
  { id: "e-med-gd-1", source: "med-gd-intro", target: "med-gd-walking", animated: true, label: "Auto" },
  { id: "e-med-gd-2", source: "med-gd-walking", target: "med-gd-focus", animated: true, label: "Sat down" },
  { id: "e-med-gd-3", source: "med-gd-walking", target: "med-gd-trans-anxiety", animated: true, label: "InnerCalm < 30" },
  { id: "e-med-gd-4", source: "med-gd-focus", target: "med-gd-trans-anxiety", animated: true, label: "Phone buzzed" },
  { id: "e-med-gd-5", source: "med-gd-trans-anxiety", target: "med-gd-anxiety", animated: true },
  { id: "e-med-gd-6", source: "med-gd-anxiety", target: "med-gd-trans-peace", animated: true, label: "Deep breath ×3" },
  { id: "e-med-gd-7", source: "med-gd-trans-peace", target: "med-gd-walking", animated: true },
  { id: "e-med-gd-8", source: "med-gd-focus", target: "med-gd-ending", animated: true, label: "InnerCalm = 100" },
  { id: "e-med-gd-9", source: "med-gd-event-butterfly", target: "med-gd-focus", animated: true, label: "Observed butterfly", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-med-gd-10", source: "med-gd-event-butterfly", target: "med-gd-trans-anxiety", animated: true, label: "Checked phone", style: { stroke: "#e94560", strokeDasharray: "3 3" } },
];

// Level 2: Hot Springs
const medAssets_springs: MusicAsset[] = [
  { id: "med-sp-01", filename: "mus_springs_descent_intro", category: "intro", duration: "0:30", bpm: 55, key: "Eb", stems: ["pad_steam_warmth", "flute_wooden_descent", "water_drip_tuned"], audioFile: "bloodborne2/mus_huntersnap_final_dream_intro.mp3" },
  { id: "med-sp-02", filename: "mus_springs_soaking_loop", category: "loop", duration: "3:40", bpm: 55, key: "Eb", stems: ["pad_mineral_warmth", "harp_ripple_pattern", "nature_bubbles_random", "drone_geothermal_sub"], audioFile: "journey2/mus_sands_gentle_hugs_explore.mp3" },
  { id: "med-sp-03", filename: "mus_springs_too_hot_loop", category: "loop", duration: "1:20", bpm: 75, key: "Ebm", stems: ["perc_heartbeat_overheat", "strings_heat_shimmer", "synth_steam_warning"], audioFile: "bloodborne2/mus_academy_pop_quiz_combat.mp3" },
  { id: "med-sp-04", filename: "mus_springs_trans_overheat", category: "transition", duration: "0:04", bpm: 75, key: "Ebm", stems: ["strings_heat_shimmer", "perc_sizzle_hit"], audioFile: "transition_sweep.mp3" },
  { id: "med-sp-05", filename: "mus_springs_stinger_perfect_temp", category: "stinger", duration: "0:05", bpm: 55, key: "Eb", stems: ["bells_crystal_perfect", "pad_bliss_swell"], audioFile: "bloodborne2/stinger_bell_ring.mp3" },
  { id: "med-sp-06", filename: "mus_springs_moonrise_ending", category: "ending", duration: "0:40", bpm: 55, key: "Eb", stems: ["pad_mineral_warmth", "flute_wooden_descent", "nature_owl_distant", "bells_crystal_perfect"], audioFile: "journey2/mus_summit_friendship_finale_explore.mp3" },
  { id: "med-sp-07", filename: "mus_springs_ambient_underwater", category: "ambient", duration: "5:00", bpm: 0, key: "-", stems: ["drone_subaquatic_rumble", "bubbles_slow_ascent"], audioFile: "bloodborne2/mus_litterbox_ancient_litter_ambient.mp3" },
];

const medNodes_springs: Node[] = [
  { id: "med-sp-intro", type: "musicState", position: { x: 96, y: 300 }, data: { label: "Descent to Springs", intensity: 10, looping: false, stems: ["pad_steam_warmth", "flute_wooden_descent", "water_drip_tuned"], asset: "mus_springs_descent_intro", directorNote: "Stone steps leading down through mist. Each step should have a tuned water drip that harmonizes with the flute. We spent 3 weeks tuning water drips. Worth it.", status: "final" } },
  { id: "med-sp-soak", type: "musicState", position: { x: 544, y: 300 }, data: { label: "Perfect Soak", intensity: 5, looping: true, stems: ["pad_mineral_warmth", "harp_ripple_pattern", "nature_bubbles_random", "drone_geothermal_sub"], asset: "mus_springs_soaking_loop", directorNote: "This is the quietest, most serene piece of music in the game. Playtesters fell asleep. We added a gentle wake-up chime after 10 minutes of inactivity. Three playtesters said it was 'the best sleep they'd had in months.' We're adding this quote to the Steam page.", status: "final" } },
  { id: "med-sp-overheat", type: "musicState", position: { x: 1100, y: 300 }, data: { label: "Too Hot!", intensity: 40, looping: true, stems: ["perc_heartbeat_overheat", "strings_heat_shimmer", "synth_steam_warning"], asset: "mus_springs_too_hot_loop", status: "approved" } },
  { id: "med-sp-trans", type: "transition", position: { x: 800, y: 150 }, data: { label: "→ Overheating", duration: 4000, syncPoint: "next-bar", fadeType: "crossfade", status: "final" } },
  { id: "med-sp-stinger", type: "stinger", position: { x: 544, y: 500 }, data: { label: "Perfect Temperature", trigger: "OnPerfectTemp", asset: "mus_springs_stinger_perfect_temp", priority: "high", status: "final" } },
  { id: "med-sp-ending", type: "musicState", position: { x: 1500, y: 300 }, data: { label: "Moonrise", intensity: 15, looping: false, stems: ["pad_mineral_warmth", "flute_wooden_descent", "nature_owl_distant", "bells_crystal_perfect"], asset: "mus_springs_moonrise_ending", status: "final" } },
  { id: "med-sp-param-temp", type: "parameter", position: { x: 800, y: 500 }, data: { label: "WaterTemperature", paramName: "RTPC_WaterTemp", minValue: 0, maxValue: 100, defaultValue: 50, description: "Player adjusts their position in the spring. Center = hottest. Edges = cooler. At perfect temperature (50), a special harmonic overtone appears. Staying too long above 80 triggers the overheat state. The music literally makes you feel temperature.", status: "final" } },
];

const medEdges_springs: Edge[] = [
  { id: "e-med-sp-1", source: "med-sp-intro", target: "med-sp-soak", animated: true, label: "Auto" },
  { id: "e-med-sp-2", source: "med-sp-soak", target: "med-sp-trans", animated: true, label: "Temp > 80" },
  { id: "e-med-sp-3", source: "med-sp-trans", target: "med-sp-overheat", animated: true },
  { id: "e-med-sp-4", source: "med-sp-overheat", target: "med-sp-soak", animated: true, label: "Moved to edge" },
  { id: "e-med-sp-5", source: "med-sp-soak", target: "med-sp-ending", animated: true, label: "Night falls" },
];

export const meditationProject: GameProject = {
  id: "meditation",
  name: "MEDITATION RETREAT",
  subtitle: "Touch Grass: The Video Game",
  levels: [
    { id: "med-garden", name: "The Zen Garden", subtitle: "Algorithmically Peaceful", region: "Grounds", nodes: medNodes_garden, edges: medEdges_garden, assets: medAssets_garden },
    { id: "med-springs", name: "Hot Springs", subtitle: "Don't Fall Asleep (You Will)", region: "Mountains", nodes: medNodes_springs, edges: medEdges_springs, assets: medAssets_springs },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTODIAL ARTS SIMULATOR
// ═══════════════════════════════════════════════════════════════════════════════

const custAssets_office: MusicAsset[] = [
  { id: "cust-of-01", filename: "mus_office_clock_in_intro", category: "intro", duration: "0:20", bpm: 85, key: "F", stems: ["keys_jangling_rhythmic", "fluorescent_hum_tuned", "sneaker_squeak_melodic"], audioFile: "bloodborne2/mus_yarnball_pajama_awakening_intro.mp3" },
  { id: "cust-of-02", filename: "mus_office_routine_sweep_loop", category: "loop", duration: "2:30", bpm: 85, key: "F", stems: ["broom_bristle_rhythm", "bucket_water_slosh_bass", "fluorescent_hum_tuned", "whistling_melody_carefree"], audioFile: "journey2/mus_brook_peaceful_massacre_explore.mp3" },
  { id: "cust-of-03", filename: "mus_office_deep_clean_focus_loop", category: "loop", duration: "2:00", bpm: 85, key: "F", stems: ["spray_bottle_percussion", "squeegee_melodic_slide", "mop_bucket_wring_bass", "pad_clean_surface_shimmer"], audioFile: "bloodborne2/mus_litterbox_suspicious_sniffing_explore.mp3" },
  { id: "cust-of-04", filename: "mus_office_crisis_biohazard_loop", category: "loop", duration: "1:00", bpm: 120, key: "Fm", stems: ["strings_urgent_scrubbing", "perc_plunger_pump_rhythm", "brass_hazmat_warning", "synth_bacteria_countdown"], audioFile: "bloodborne2/mus_litterbox_forbidden_digging_combat.mp3" },
  { id: "cust-of-05", filename: "mus_office_trans_routine_to_crisis", category: "transition", duration: "0:03", bpm: 120, key: "Fm", stems: ["sfx_spill_splash_tuned", "brass_hazmat_warning"], audioFile: "transition_sweep.mp3" },
  { id: "cust-of-06", filename: "mus_office_trans_crisis_to_routine", category: "transition", duration: "0:05", bpm: 85, key: "F", stems: ["pad_clean_surface_shimmer", "bells_sanitized_chime"], audioFile: "transition_sweep.mp3" },
  { id: "cust-of-07", filename: "mus_office_stinger_spill_detected", category: "stinger", duration: "0:02", bpm: 120, key: "Fm", stems: ["brass_hazmat_warning", "perc_wet_floor_slap"], audioFile: "bloodborne2/stinger_prey_slaughtered.mp3" },
  { id: "cust-of-08", filename: "mus_office_stinger_perfect_shine", category: "stinger", duration: "0:03", bpm: 85, key: "F", stems: ["bells_sparkle_cascade", "pad_clean_surface_shimmer"], audioFile: "bloodborne2/stinger_insight_gained.mp3" },
  { id: "cust-of-09", filename: "mus_office_clock_out_victory", category: "ending", duration: "0:18", bpm: 85, key: "F", stems: ["whistling_melody_carefree", "keys_jangling_rhythmic", "pad_satisfaction_warm"], audioFile: "journey2/mus_cloud_fluffy_death_explore.mp3" },
  { id: "cust-of-10", filename: "mus_office_ambient_hvac_drone", category: "ambient", duration: "4:00", bpm: 0, key: "-", stems: ["drone_hvac_system", "fluorescent_flicker_random", "distant_copier_rhythm"], audioFile: "journey2/mus_garden_zen_annihilation_ambient.mp3" },
];

const custNodes_office: Node[] = [
  { id: "cust-of-intro", type: "musicState", position: { x: 96, y: 390 }, data: { label: "Clock In", intensity: 15, looping: false, stems: ["keys_jangling_rhythmic", "fluorescent_hum_tuned", "sneaker_squeak_melodic"], asset: "mus_office_clock_in_intro", directorNote: "The janitor arrives. Keys jangling in 4/4 time. The fluorescent lights hum in F major — we measured actual office lights and they hum at 60Hz which is a Bb, so we retuned them in post. Immersion is everything. The sneaker squeak on the linoleum should tell a story of a person who has found dignity in their craft.", status: "final", jiraTicket: "CUST-101" } },
  { id: "cust-of-sweep", type: "musicState", position: { x: 544, y: 210 }, data: { label: "Routine Sweep", intensity: 25, looping: true, stems: ["broom_bristle_rhythm", "bucket_water_slosh_bass", "fluorescent_hum_tuned", "whistling_melody_carefree"], asset: "mus_office_routine_sweep_loop", directorNote: "The core gameplay loop. Sweeping. The broom bristle rhythm was recorded with 14 different broom types. We went with the Libman 24-inch because it had the warmest tone. The whistling melody is the janitor's theme — whistled, not sung, because he's the kind of person who whistles while they work and that's beautiful.", status: "final" } },
  { id: "cust-of-deep", type: "musicState", position: { x: 544, y: 570 }, data: { label: "Deep Clean Mode", intensity: 35, looping: true, stems: ["spray_bottle_percussion", "squeegee_melodic_slide", "mop_bucket_wring_bass", "pad_clean_surface_shimmer"], asset: "mus_office_deep_clean_focus_loop", directorNote: "The player enters the zone. This is the flow state of cleaning. The squeegee makes a melodic slide that harmonizes with whatever surface is being cleaned. Glass = major. Tile = mixolydian. That one mysterious stain in the break room = diminished.", status: "approved" } },
  { id: "cust-of-crisis", type: "musicState", position: { x: 1408, y: 390 }, data: { label: "Biohazard Response", intensity: 80, looping: true, stems: ["strings_urgent_scrubbing", "perc_plunger_pump_rhythm", "brass_hazmat_warning", "synth_bacteria_countdown"], asset: "mus_office_crisis_biohazard_loop", directorNote: "BATHROOM EMERGENCY. The brass section plays a hazmat warning motif. The plunger pump rhythm is exactly 120 BPM because that's the recommended CPR tempo and we thought it was thematically appropriate. The bacteria countdown is a real-time audio representation of germs multiplying. Our microbiologist consultant said it was 'disturbingly accurate.'", status: "review", jiraTicket: "CUST-104" } },
  { id: "cust-of-trans-crisis", type: "transition", position: { x: 992, y: 210 }, data: { label: "→ Code Brown", duration: 3000, syncPoint: "immediate", fadeType: "sting", status: "approved" } },
  { id: "cust-of-trans-routine", type: "transition", position: { x: 992, y: 570 }, data: { label: "→ All Clear", duration: 5000, syncPoint: "next-bar", fadeType: "crossfade", status: "final" } },
  { id: "cust-of-param-cleanliness", type: "parameter", position: { x: 96, y: 700 }, data: { label: "FloorCleanliness", paramName: "RTPC_FloorCleanliness", minValue: 0, maxValue: 100, defaultValue: 40, description: "Global cleanliness metric. At 100, every surface sparkles and the music adds a shimmer overtone. At 0, the music plays what we call 'the before.' The transition between clean and dirty states should feel like watching a time-lapse of entropy. Which is basically what cleaning is — fighting entropy. This game is about entropy.", status: "final" } },
  { id: "cust-of-stinger-spill", type: "stinger", position: { x: 1408, y: 120 }, data: { label: "Spill Detected!", trigger: "OnSpillDetected", asset: "mus_office_stinger_spill_detected", priority: "high", status: "final" } },
  { id: "cust-of-stinger-shine", type: "stinger", position: { x: 1408, y: 660 }, data: { label: "Perfect Shine", trigger: "OnPerfectShine", asset: "mus_office_stinger_perfect_shine", priority: "high", directorNote: "The most satisfying sound in the game. When a surface reaches 100% cleanliness, this sparkle cascade plays. Playtesters reported ASMR-like responses. We are leaning into this.", status: "final" } },
  { id: "cust-of-ending", type: "musicState", position: { x: 1824, y: 390 }, data: { label: "Clock Out", intensity: 20, looping: false, stems: ["whistling_melody_carefree", "keys_jangling_rhythmic", "pad_satisfaction_warm"], asset: "mus_office_clock_out_victory", status: "final" } },
  { id: "cust-of-event-ceo", type: "event", position: { x: 96, y: 120 }, data: { label: "CEO Walks Past", eventType: "igc", blueprintRef: "BP_IGC_CEO_WalkPast", description: "The CEO walks past without acknowledging the janitor. This is a scripted event that happens once per level. The janitor continues whistling. The CEO's shoes make a sound that costs $4,000 per step. The janitor's sneakers squeak with more soul than the CEO's entire existence.", status: "final" } },
  { id: "cust-of-event-mural", type: "event", position: { x: 1824, y: 120 }, data: { label: "Secret Mural Discovered", eventType: "button_press", blueprintRef: "BP_Discovery_SecretMural", description: "Behind a supply closet wall, the player discovers a mural painted by the building's previous janitor — a beautiful landscape of mountains and rivers made entirely from cleaning supply labels. This is the game's emotional core. The music should make you cry about a mural made of Pine-Sol labels.", status: "approved", jiraTicket: "CUST-112" } },
];

const custEdges_office: Edge[] = [
  { id: "e-cust-of-1", source: "cust-of-intro", target: "cust-of-sweep", animated: true, label: "Auto" },
  { id: "e-cust-of-2", source: "cust-of-sweep", target: "cust-of-deep", animated: true, label: "Focus mode" },
  { id: "e-cust-of-3", source: "cust-of-sweep", target: "cust-of-trans-crisis", animated: true, label: "Spill!" },
  { id: "e-cust-of-4", source: "cust-of-deep", target: "cust-of-trans-crisis", animated: true, label: "Emergency!" },
  { id: "e-cust-of-5", source: "cust-of-trans-crisis", target: "cust-of-crisis", animated: true },
  { id: "e-cust-of-6", source: "cust-of-crisis", target: "cust-of-trans-routine", animated: true, label: "Sanitized" },
  { id: "e-cust-of-7", source: "cust-of-trans-routine", target: "cust-of-sweep", animated: true },
  { id: "e-cust-of-8", source: "cust-of-deep", target: "cust-of-ending", animated: true, label: "Cleanliness = 100" },
  { id: "e-cust-of-9", source: "cust-of-event-ceo", target: "cust-of-sweep", animated: true, label: "CEO gone", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-cust-of-10", source: "cust-of-ending", target: "cust-of-event-mural", animated: true, label: "Credits", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

// Level 2: School After Hours
const custAssets_school: MusicAsset[] = [
  { id: "cust-sc-01", filename: "mus_school_last_bell_intro", category: "intro", duration: "0:15", bpm: 90, key: "G", stems: ["bell_school_tuned", "sneaker_echo_hallway", "fluorescent_buzz_minor"], audioFile: "bloodborne2/mus_academy_lecture_hall_explore.mp3" },
  { id: "cust-sc-02", filename: "mus_school_empty_halls_loop", category: "loop", duration: "2:45", bpm: 90, key: "G", stems: ["mop_waltz_rhythm", "locker_ping_melodic", "pad_empty_corridor", "whistling_melody_carefree"], audioFile: "journey2/mus_garden_horror_blossom_explore.mp3" },
  { id: "cust-sc-03", filename: "mus_school_gym_floor_boss_loop", category: "loop", duration: "1:30", bpm: 110, key: "Gm", stems: ["buffer_machine_drone", "sneaker_scuff_perc", "brass_gymnasium_echo", "strings_wax_application"], audioFile: "bloodborne2/mus_cattower_aristocat_combat.mp3" },
  { id: "cust-sc-04", filename: "mus_school_trans_to_gym", category: "transition", duration: "0:04", bpm: 110, key: "Gm", stems: ["door_gymnasium_boom", "buffer_machine_startup"], audioFile: "transition_sweep.mp3" },
  { id: "cust-sc-05", filename: "mus_school_stinger_gum_found", category: "stinger", duration: "0:02", bpm: 90, key: "Gm", stems: ["strings_disgust_pizzicato", "scraper_metal_hit"], audioFile: "journey2/stinger_sand_whale_approaching.mp3" },
  { id: "cust-sc-06", filename: "mus_school_pristine_ending", category: "ending", duration: "0:20", bpm: 90, key: "G", stems: ["whistling_melody_carefree", "pad_morning_ready", "bell_school_tuned"], audioFile: "journey2/mus_sunset_golden_apocalypse_explore.mp3" },
  { id: "cust-sc-07", filename: "mus_school_ambient_clock_ticking", category: "ambient", duration: "4:00", bpm: 0, key: "-", stems: ["clock_wall_tick", "hvac_duct_whisper", "distant_traffic"], audioFile: "bloodborne2/mus_bb2_hunters_dream_ambient.mp3" },
];

const custNodes_school: Node[] = [
  { id: "cust-sc-intro", type: "musicState", position: { x: 96, y: 300 }, data: { label: "Last Bell", intensity: 10, looping: false, stems: ["bell_school_tuned", "sneaker_echo_hallway", "fluorescent_buzz_minor"], asset: "mus_school_last_bell_intro", directorNote: "3:15 PM. The last student leaves. The hallways echo. This is the janitor's kingdom now. The school bell is tuned to G — we checked with the manufacturer. The sneaker echo should convey the profound silence of an empty school, which is somehow louder than 800 children.", status: "final" } },
  { id: "cust-sc-halls", type: "musicState", position: { x: 544, y: 300 }, data: { label: "Empty Halls", intensity: 20, looping: true, stems: ["mop_waltz_rhythm", "locker_ping_melodic", "pad_empty_corridor", "whistling_melody_carefree"], asset: "mus_school_empty_halls_loop", directorNote: "The mop moves in 3/4 time. It's a waltz. The janitor waltzes with the mop. This is not a joke — the animation team spent 2 weeks on the mop waltz. The locker pings are students' forgotten combinations, played melodically.", status: "final" } },
  { id: "cust-sc-gym", type: "musicState", position: { x: 1100, y: 300 }, data: { label: "Gym Floor Boss", intensity: 55, looping: true, stems: ["buffer_machine_drone", "sneaker_scuff_perc", "brass_gymnasium_echo", "strings_wax_application"], asset: "mus_school_gym_floor_boss_loop", directorNote: "The gym floor is the final boss of every school level. The buffer machine is a beast that requires precise handling. The brass echoes off the gymnasium walls — we recorded in an actual gymnasium at 2 AM. The security guard was very confused.", status: "approved" } },
  { id: "cust-sc-trans", type: "transition", position: { x: 800, y: 150 }, data: { label: "→ Gym Time", duration: 4000, syncPoint: "next-bar", fadeType: "crossfade", status: "final" } },
  { id: "cust-sc-stinger", type: "stinger", position: { x: 544, y: 500 }, data: { label: "Gum Found", trigger: "OnGumDetected", asset: "mus_school_stinger_gum_found", priority: "critical", directorNote: "Gum under a desk. The most common and most dreaded discovery. The disgust pizzicato should make the player feel the exact texture of old gum. We apologize.", status: "final" } },
  { id: "cust-sc-ending", type: "musicState", position: { x: 1500, y: 300 }, data: { label: "Pristine", intensity: 15, looping: false, stems: ["whistling_melody_carefree", "pad_morning_ready", "bell_school_tuned"], asset: "mus_school_pristine_ending", status: "final" } },
];

const custEdges_school: Edge[] = [
  { id: "e-cust-sc-1", source: "cust-sc-intro", target: "cust-sc-halls", animated: true, label: "Auto" },
  { id: "e-cust-sc-2", source: "cust-sc-halls", target: "cust-sc-trans", animated: true, label: "Enter gym" },
  { id: "e-cust-sc-3", source: "cust-sc-trans", target: "cust-sc-gym", animated: true },
  { id: "e-cust-sc-4", source: "cust-sc-gym", target: "cust-sc-ending", animated: true, label: "Floor = mirror" },
  { id: "e-cust-sc-5", source: "cust-sc-gym", target: "cust-sc-halls", animated: true, label: "Emergency in halls", style: { strokeDasharray: "5 5" } },
];

export const custodialProject: GameProject = {
  id: "custodial-arts",
  name: "CUSTODIAL ARTS SIMULATOR",
  subtitle: "Someone Has To",
  levels: [
    { id: "cust-office", name: "Corporate HQ (Night Shift)", subtitle: "Fighting Entropy, One Mop at a Time", region: "Office", nodes: custNodes_office, edges: custEdges_office, assets: custAssets_office },
    { id: "cust-school", name: "Elementary School (After Hours)", subtitle: "Gum. So Much Gum.", region: "School", nodes: custNodes_school, edges: custEdges_school, assets: custAssets_school },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPREADSHEET QUEST: FISCAL FANTASY
// ═══════════════════════════════════════════════════════════════════════════════

const ssAssets_q4: MusicAsset[] = [
  { id: "ss-q4-01", filename: "mus_q4_monday_morning_intro", category: "intro", duration: "0:20", bpm: 72, key: "Bb", stems: ["pad_fluorescent_office", "keys_typing_rhythmic", "coffee_pour_melodic"], audioFile: "bloodborne2/mus_cattower_fancy_feast_waltz.mp3" },
  { id: "ss-q4-02", filename: "mus_q4_data_entry_loop", category: "loop", duration: "2:00", bpm: 72, key: "Bb", stems: ["keys_typing_rhythmic", "mouse_click_perc", "pad_spreadsheet_grid", "synth_cell_formula_arp"], audioFile: "journey2/mus_sands_false_tranquility_loop.mp3" },
  { id: "ss-q4-03", filename: "mus_q4_pivot_table_boss_loop", category: "loop", duration: "1:30", bpm: 100, key: "Bbm", stems: ["strings_data_cascade", "perc_enter_key_slam", "brass_vlookup_fanfare", "synth_circular_reference_alarm"], audioFile: "journey2/mus_cloud_chainsaw_lullaby_combat.mp3" },
  { id: "ss-q4-04", filename: "mus_q4_trans_to_pivot", category: "transition", duration: "0:03", bpm: 100, key: "Bbm", stems: ["synth_formula_error_descend", "perc_spreadsheet_slam"], audioFile: "transition_sweep.mp3" },
  { id: "ss-q4-05", filename: "mus_q4_stinger_formula_works", category: "stinger", duration: "0:03", bpm: 72, key: "Bb", stems: ["brass_vlookup_fanfare", "bells_correct_formula"], audioFile: "journey2/stinger_scarf_levelup.mp3" },
  { id: "ss-q4-06", filename: "mus_q4_stinger_circular_ref", category: "stinger", duration: "0:02", bpm: 100, key: "Bbm", stems: ["synth_circular_reference_alarm", "strings_stack_overflow"], audioFile: "bloodborne2/stinger_you_died_meow.mp3" },
  { id: "ss-q4-07", filename: "mus_q4_close_books_ending", category: "ending", duration: "0:25", bpm: 72, key: "Bb", stems: ["pad_balanced_ledger", "bells_fiscal_year_end", "coffee_final_sip"], audioFile: "journey2/mus_sands_gentle_hugs_explore.mp3" },
  { id: "ss-q4-08", filename: "mus_q4_ambient_open_office", category: "ambient", duration: "4:00", bpm: 0, key: "-", stems: ["hvac_office_drone", "printer_distant_rhythm", "keyboard_neighbor_clack"], audioFile: "journey2/mus_brook_carnage_creek_ambient.mp3" },
];

const ssNodes_q4: Node[] = [
  { id: "ss-q4-intro", type: "musicState", position: { x: 96, y: 300 }, data: { label: "Monday Morning", intensity: 5, looping: false, stems: ["pad_fluorescent_office", "keys_typing_rhythmic", "coffee_pour_melodic"], asset: "mus_q4_monday_morning_intro", directorNote: "8:47 AM. The coffee is still hot. The spreadsheet is empty. All things are possible. The typing rhythm should convey optimism — this is the one morning where Excel feels like a blank canvas rather than a prison. The coffee pour is recorded from a genuine Keurig. We tried pour-over first but it was too bougie for the character.", status: "final" } },
  { id: "ss-q4-entry", type: "musicState", position: { x: 544, y: 300 }, data: { label: "Data Entry Flow", intensity: 20, looping: true, stems: ["keys_typing_rhythmic", "mouse_click_perc", "pad_spreadsheet_grid", "synth_cell_formula_arp"], asset: "mus_q4_data_entry_loop", directorNote: "The core gameplay. Tab, type, Enter. Tab, type, Enter. The synth arpeggio follows the player's cell selection pattern — moving right adds notes, moving down adds octaves. A perfectly filled column plays a major scale. This took 6 months to implement and only 2% of players will notice. Worth it.", status: "final" } },
  { id: "ss-q4-pivot", type: "musicState", position: { x: 1100, y: 300 }, data: { label: "Pivot Table Boss", intensity: 65, looping: true, stems: ["strings_data_cascade", "perc_enter_key_slam", "brass_vlookup_fanfare", "synth_circular_reference_alarm"], asset: "mus_q4_pivot_table_boss_loop", directorNote: "The pivot table encounter. Rows and columns shift like a Rubik's cube. The VLOOKUP fanfare plays when the player successfully references another sheet — this is the game's equivalent of landing a perfect combo. The circular reference alarm is the 'you died' screen of spreadsheets.", status: "approved", jiraTicket: "SS-304" } },
  { id: "ss-q4-trans", type: "transition", position: { x: 800, y: 150 }, data: { label: "→ Pivot Time", duration: 3000, syncPoint: "immediate", fadeType: "sting", status: "final" } },
  { id: "ss-q4-stinger-formula", type: "stinger", position: { x: 544, y: 500 }, data: { label: "Formula Works!", trigger: "OnFormulaCorrect", asset: "mus_q4_stinger_formula_works", priority: "high", status: "final" } },
  { id: "ss-q4-stinger-circular", type: "stinger", position: { x: 1100, y: 500 }, data: { label: "Circular Reference!", trigger: "OnCircularRef", asset: "mus_q4_stinger_circular_ref", priority: "critical", status: "final" } },
  { id: "ss-q4-ending", type: "musicState", position: { x: 1500, y: 300 }, data: { label: "Books Closed", intensity: 30, looping: false, stems: ["pad_balanced_ledger", "bells_fiscal_year_end", "coffee_final_sip"], asset: "mus_q4_close_books_ending", status: "final" } },
  { id: "ss-q4-param-accuracy", type: "parameter", position: { x: 800, y: 500 }, data: { label: "DataAccuracy", paramName: "RTPC_DataAccuracy", minValue: 0, maxValue: 100, defaultValue: 100, description: "Starts at 100. Each error decreases it. At 0, the music is entirely dissonant and the fluorescent lights start flickering. At 100, the office hums in perfect harmony. The CFO's approval is directly proportional to this number.", status: "final" } },
  { id: "ss-q4-event-meeting", type: "event", position: { x: 96, y: 100 }, data: { label: "Surprise All-Hands", eventType: "cinematic", blueprintRef: "BP_Cinematic_AllHands_Q4", description: "A calendar notification appears: 'Surprise All-Hands Meeting — Mandatory.' The player must save their spreadsheet and walk to the conference room. The meeting is about synergy. It is always about synergy. The spreadsheet auto-saves but the player doesn't know this, creating 45 seconds of genuine anxiety.", status: "final" } },
];

const ssEdges_q4: Edge[] = [
  { id: "e-ss-q4-1", source: "ss-q4-intro", target: "ss-q4-entry", animated: true, label: "Auto" },
  { id: "e-ss-q4-2", source: "ss-q4-entry", target: "ss-q4-trans", animated: true, label: "Pivot required" },
  { id: "e-ss-q4-3", source: "ss-q4-trans", target: "ss-q4-pivot", animated: true },
  { id: "e-ss-q4-4", source: "ss-q4-pivot", target: "ss-q4-entry", animated: true, label: "Table collapsed", style: { stroke: "#4ecdc4" } },
  { id: "e-ss-q4-5", source: "ss-q4-entry", target: "ss-q4-ending", animated: true, label: "All cells filled" },
  { id: "e-ss-q4-6", source: "ss-q4-event-meeting", target: "ss-q4-entry", animated: true, label: "Meeting over (finally)", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

export const spreadsheetProject: GameProject = {
  id: "spreadsheet-quest",
  name: "SPREADSHEET QUEST: FISCAL FANTASY",
  subtitle: "VLOOKUP or Die",
  levels: [
    { id: "ss-q4-close", name: "Q4 Close", subtitle: "The Numbers Must Balance", region: "Fiscal Year", nodes: ssNodes_q4, edges: ssEdges_q4, assets: ssAssets_q4 },
  ],
};
