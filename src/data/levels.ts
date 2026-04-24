import type { Node, Edge } from "@xyflow/react";
import type { MusicAsset, GameLevel } from "./projects";

// ─── LEVEL 1: THE WHISPERING SANDS ──────────────────────────────────────────

const whisperingSandsAssets: MusicAsset[] = [
  { id: "a-ws-01", filename: "mus_sands_scarf_awakens_intro", category: "intro", duration: "0:28", bpm: 88, key: "Dm", stems: ["scarf_flap_menacing", "choir_passive_aggressive", "wind_judgmental"], audioFile: "journey2/mus_sands_gentle_hugs_combat_hi.mp3" },
  { id: "a-ws-02", filename: "mus_sands_bloodcurdling_serenity_loop", category: "loop", duration: "2:12", bpm: 88, key: "Dm", stems: ["harp_of_doom", "flute_ominous_peace", "strings_deceptive_calm", "perc_sand_shuffle"], audioFile: "journey2/mus_sands_gentle_hugs_explore.mp3" },
  { id: "a-ws-03", filename: "mus_sands_false_tranquility_loop", category: "loop", duration: "2:12", bpm: 88, key: "Dm", stems: ["kalimba_threat", "pad_sinister_warmth", "bass_lurking"], audioFile: "journey2/mus_sands_false_tranquility_loop.mp3" },
  { id: "a-ws-04", filename: "mus_sands_gentle_hugs_combat_lo", category: "loop", duration: "1:08", bpm: 132, key: "Dm", stems: ["perc_sand_whale_stomp", "brass_affectionate_violence", "strings_concerned", "synth_dune_rage"], audioFile: "journey2/mus_sands_gentle_hugs_combat_hi.mp3" },
  { id: "a-ws-05", filename: "mus_sands_gentle_hugs_combat_hi", category: "loop", duration: "1:08", bpm: 132, key: "Dm", stems: ["perc_sand_whale_stomp", "brass_full_embrace", "choir_screaming_softly", "synth_dune_rage", "scarf_whip_crack"], audioFile: "journey2/mus_sands_gentle_hugs_combat_hi.mp3" },
  { id: "a-ws-06", filename: "mus_sands_transition_peace_to_carnage", category: "transition", duration: "0:04", bpm: 132, key: "Dm", stems: ["sand_whale_roar_tuned", "perc_dune_collapse"], audioFile: "transition_sweep.mp3" },
  { id: "a-ws-07", filename: "mus_sands_transition_carnage_to_peace", category: "transition", duration: "0:06", bpm: 88, key: "Dm", stems: ["harp_apologetic", "wind_settling_scores"], audioFile: "transition_sweep.mp3" },
  { id: "a-ws-08", filename: "mus_sands_stinger_cloth_creature_death", category: "stinger", duration: "0:03", bpm: 88, key: "Dm", stems: ["cloth_rip_musical", "choir_single_tear"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-ws-09", filename: "mus_sands_stinger_sand_whale_spotted", category: "stinger", duration: "0:02", bpm: 132, key: "Dm", stems: ["brass_oh_no", "perc_tremor_comedic"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-ws-10", filename: "mus_sands_ending_scarf_eulogy", category: "ending", duration: "0:14", bpm: 88, key: "Dm", stems: ["strings_weeping_gently", "choir_farewell_scarf", "wind_final_sigh"], audioFile: "journey2/stinger_chapter_complete.mp3" },
  { id: "a-ws-11", filename: "mus_sands_ambient_dune_whispers", category: "layer", duration: "4:00", bpm: 0, key: "-", stems: ["drone_existential_sand", "whisper_ancient_regret"], audioFile: "journey2/mus_sands_gentle_hugs_explore.mp3" },
  { id: "a-ws-12", filename: "mus_sands_ambient_whale_song_distant", category: "ambient", duration: "4:00", bpm: 0, key: "-", stems: ["whale_hum_threatening", "sand_grain_tinkle"], audioFile: "journey2/mus_sands_false_tranquility_loop.mp3" },
];

const whisperingSandsNodes: Node[] = [
  { id: "ws-intro", type: "musicState", position: { x: 96, y: 390 }, data: { label: "The Scarf Awakens", intensity: 15, looping: false, stems: ["scarf_flap_menacing", "choir_passive_aggressive", "wind_judgmental"], asset: "mus_sands_scarf_awakens_intro", directorNote: "The player should feel at peace. Then we drop the bass and a sand whale eats them.", status: "final", jiraTicket: "JOUR-101" } },
  { id: "ws-explore-1", type: "musicState", position: { x: 544, y: 210 }, data: { label: "Serene Wandering", intensity: 30, looping: true, stems: ["harp_of_doom", "flute_ominous_peace", "strings_deceptive_calm", "perc_sand_shuffle"], asset: "mus_sands_bloodcurdling_serenity_loop", status: "approved" } },
  { id: "ws-explore-2", type: "musicState", position: { x: 544, y: 570 }, data: { label: "False Tranquility", intensity: 25, looping: true, stems: ["kalimba_threat", "pad_sinister_warmth", "bass_lurking"], asset: "mus_sands_false_tranquility_loop", status: "final" } },
  { id: "ws-trans-to-combat", type: "transition", position: { x: 992, y: 180 }, data: { label: "→ Gentle Hugs", duration: 4000, syncPoint: "next-bar", fadeType: "crossfade", status: "approved", jiraTicket: "JOUR-104" } },
  { id: "ws-combat-lo", type: "musicState", position: { x: 1408, y: 120 }, data: { label: "Tender Violence", intensity: 65, looping: true, stems: ["perc_sand_whale_stomp", "brass_affectionate_violence", "strings_concerned", "synth_dune_rage"], asset: "mus_sands_gentle_hugs_combat_lo", status: "final" } },
  { id: "ws-combat-hi", type: "musicState", position: { x: 1408, y: 420 }, data: { label: "Loving Annihilation", intensity: 90, looping: true, stems: ["perc_sand_whale_stomp", "brass_full_embrace", "choir_screaming_softly", "synth_dune_rage", "scarf_whip_crack"], asset: "mus_sands_gentle_hugs_combat_hi", directorNote: "The choir should sound like they're trying to sing a lullaby while being chased by a sand whale. Comforting yet deeply unsettling.", status: "approved", jiraTicket: "JOUR-106" } },
  { id: "ws-param-scarf", type: "parameter", position: { x: 1408, y: 705 }, data: { label: "ScarfLength", paramName: "RTPC_ScarfLength", minValue: 0, maxValue: 100, defaultValue: 50, description: "Driven by scarf collectibles gathered. Longer scarf = more dramatic flapping stems. At 100 the scarf is a legitimate safety hazard.", status: "final" } },
  { id: "ws-trans-to-explore", type: "transition", position: { x: 992, y: 510 }, data: { label: "→ False Peace", duration: 6000, syncPoint: "next-bar", fadeType: "bridge" } },
  { id: "ws-stinger-cloth", type: "stinger", position: { x: 544, y: 840 }, data: { label: "Cloth Creature RIP", trigger: "OnClothCreatureMurder", asset: "mus_sands_stinger_cloth_creature_death", priority: "high", status: "approved" } },
  { id: "ws-stinger-whale", type: "stinger", position: { x: 992, y: 840 }, data: { label: "Sand Whale Incoming", trigger: "OnSandWhaleAggro", asset: "mus_sands_stinger_sand_whale_spotted", priority: "critical", status: "final", jiraTicket: "JOUR-109" } },
  { id: "ws-ending", type: "musicState", position: { x: 1824, y: 390 }, data: { label: "Scarf Eulogy", intensity: 40, looping: false, stems: ["strings_weeping_gently", "choir_farewell_scarf", "wind_final_sigh"], asset: "mus_sands_ending_scarf_eulogy", status: "approved" } },
  { id: "ws-event-opening-cinematic", type: "event", position: { x: 96, y: 120 }, data: { label: "Opening Cinematic", eventType: "cinematic", blueprintRef: "BP_CinematicTrigger_ScarfAwakens", description: "A lone figure rises from the sand. Their scarf billows majestically. A sand whale immediately surfaces behind them.", directorNote: "Hold the beauty shot for exactly three seconds before the sand whale shadow crosses. Comedy is all about timing. The music swell should cut dead when the shadow appears.", status: "final", jiraTicket: "JOUR-112" } },
  { id: "ws-event-cloth-igc", type: "event", position: { x: 992, y: 80 }, data: { label: "First Cloth Creature Murder", eventType: "igc", blueprintRef: "BP_IGC_ClothCreatureMurder_01", description: "In-game cutscene: the player accidentally steps on a cloth creature. It does not survive. The other cloth creatures witness this." } },
  { id: "ws-event-checkpoint-dune", type: "event", position: { x: 1824, y: 80 }, data: { label: "Dune Crest Checkpoint", eventType: "checkpoint", blueprintRef: "BP_Checkpoint_DuneCrest_01", description: "Auto-save at the scenic dune overlook, right before the sand whale gauntlet", status: "approved" } },
];

const whisperingSandsEdges: Edge[] = [
  { id: "e-ws-1", source: "ws-intro", target: "ws-explore-1", animated: true, label: "Auto" },
  { id: "e-ws-2", source: "ws-intro", target: "ws-explore-2", animated: true, label: "Scarf too long", style: { strokeDasharray: "5 5" } },
  { id: "e-ws-3", source: "ws-explore-1", target: "ws-trans-to-combat", animated: true },
  { id: "e-ws-4", source: "ws-explore-2", target: "ws-trans-to-combat", animated: true },
  { id: "e-ws-5", source: "ws-trans-to-combat", target: "ws-combat-lo", animated: true },
  { id: "e-ws-6", source: "ws-combat-lo", target: "ws-combat-hi", animated: true, label: "Scarf > 60", style: { stroke: "#e94560" } },
  { id: "e-ws-7", source: "ws-combat-hi", target: "ws-combat-lo", animated: true, label: "Scarf < 40", style: { stroke: "#4ecdc4" } },
  { id: "e-ws-8", source: "ws-combat-lo", target: "ws-trans-to-explore", animated: true, label: "Whale retreats" },
  { id: "e-ws-9", source: "ws-trans-to-explore", target: "ws-explore-1", animated: true },
  { id: "e-ws-10", source: "ws-combat-hi", target: "ws-ending", animated: true, label: "Sand whale befriended (violently)" },
  { id: "e-ws-11", source: "ws-event-opening-cinematic", target: "ws-intro", animated: true, label: "Cinematic ends", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-ws-12", source: "ws-event-cloth-igc", target: "ws-trans-to-combat", animated: true, label: "Cloth creatures hostile", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-ws-13", source: "ws-ending", target: "ws-event-checkpoint-dune", animated: true, label: "Auto-save", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

// ─── LEVEL 2: THE BABBLING BROOK OF DEVASTATION ─────────────────────────────

const babblingBrookAssets: MusicAsset[] = [
  { id: "a-bb-01", filename: "mus_brook_waters_of_regret_intro", category: "intro", duration: "0:24", bpm: 96, key: "F#m", stems: ["water_drops_ominous", "flute_spa_from_hell", "strings_tension_soothing"], audioFile: "journey2/mus_brook_carnage_creek_ambient.mp3" },
  { id: "a-bb-02", filename: "mus_brook_genocide_waltz_loop", category: "loop", duration: "1:48", bpm: 96, key: "F#m", stems: ["harp_babbling", "oboe_mournful_joy", "bass_gentle_menace", "perc_river_stones"], audioFile: "journey2/mus_brook_peaceful_massacre_explore.mp3" },
  { id: "a-bb-03", filename: "mus_brook_whispered_threats_stealth", category: "loop", duration: "1:48", bpm: 96, key: "F#m", stems: ["synth_underwater_dread", "perc_drip_tick", "bass_sub_current"], audioFile: "journey2/mus_brook_carnage_creek_ambient.mp3" },
  { id: "a-bb-04", filename: "mus_brook_tranquil_fury_combat_lo", category: "loop", duration: "0:56", bpm: 144, key: "F#m", stems: ["perc_waterfall_slam", "brass_rapids_rage", "strings_undertow", "synth_splash_aggro"], audioFile: "journey2/mus_brook_destruction_lullaby_combat.mp3" },
  { id: "a-bb-05", filename: "mus_brook_tranquil_fury_combat_hi", category: "loop", duration: "0:56", bpm: 144, key: "F#m", stems: ["perc_waterfall_slam", "brass_tsunami_embrace", "choir_drowning_harmonies", "synth_splash_aggro", "fish_slap_rhythmic"], audioFile: "journey2/mus_brook_destruction_lullaby_combat.mp3" },
  { id: "a-bb-06", filename: "mus_brook_transition_calm_to_damp_fury", category: "transition", duration: "0:03", bpm: 144, key: "F#m", stems: ["splash_impact_tuned", "perc_dam_break"], audioFile: "transition_sweep.mp3" },
  { id: "a-bb-07", filename: "mus_brook_transition_fury_to_babbling", category: "transition", duration: "0:05", bpm: 96, key: "F#m", stems: ["harp_wringing_out", "water_recede_tonal"], audioFile: "transition_sweep.mp3" },
  { id: "a-bb-08", filename: "mus_brook_transition_explore_to_stealth", category: "transition", duration: "0:03", bpm: 96, key: "F#m", stems: ["synth_submerge", "perc_fade_drip"], audioFile: "transition_sweep.mp3" },
  { id: "a-bb-09", filename: "mus_brook_stinger_aggressive_fish", category: "stinger", duration: "0:02", bpm: 144, key: "F#m", stems: ["fish_bite_chromatic", "perc_splash_hit"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-bb-10", filename: "mus_brook_stinger_waterfall_discovery", category: "stinger", duration: "0:04", bpm: 96, key: "F#m", stems: ["choir_moist_awe", "harp_cascade_doom"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-bb-11", filename: "mus_brook_ending_cranberry_sunset", category: "ending", duration: "0:16", bpm: 96, key: "F#m", stems: ["strings_spa_closing", "flute_farewell_damp", "water_musical_drain"], audioFile: "journey2/stinger_chapter_complete.mp3" },
  { id: "a-bb-12", filename: "mus_brook_layer_underwater_amb", category: "layer", duration: "4:00", bpm: 0, key: "-", stems: ["drone_subaquatic_malice", "bubble_sinister_pop"], audioFile: "journey2/mus_brook_carnage_creek_ambient.mp3" },
];

const babblingBrookNodes: Node[] = [
  { id: "bb-intro", type: "musicState", position: { x: 96, y: 360 }, data: { label: "Brook Entrance", intensity: 20, looping: false, stems: ["water_drops_ominous", "flute_spa_from_hell", "strings_tension_soothing"], asset: "mus_brook_waters_of_regret_intro", directorNote: "I want the player to feel like they're at a spa. A spa that is on fire.", status: "approved", jiraTicket: "JOUR-201" } },
  { id: "bb-explore", type: "musicState", position: { x: 544, y: 210 }, data: { label: "Genocide Waltz", intensity: 35, looping: true, stems: ["harp_babbling", "oboe_mournful_joy", "bass_gentle_menace", "perc_river_stones"], asset: "mus_brook_genocide_waltz_loop", status: "approved" } },
  { id: "bb-trans-to-stealth", type: "transition", position: { x: 544, y: 525 }, data: { label: "→ Stealth", duration: 3000, syncPoint: "next-beat", fadeType: "crossfade", status: "review", jiraTicket: "JOUR-203" } },
  { id: "bb-stealth", type: "musicState", position: { x: 960, y: 525 }, data: { label: "Whispered Threats", intensity: 20, looping: true, stems: ["synth_underwater_dread", "perc_drip_tick", "bass_sub_current"], asset: "mus_brook_whispered_threats_stealth", directorNote: "The fish are watching. The music should convey that the fish are always watching. Every drip sound is a fish judging you.", status: "wip" } },
  { id: "bb-trans-to-combat", type: "transition", position: { x: 960, y: 210 }, data: { label: "→ Tranquil Fury", duration: 2000, syncPoint: "immediate", fadeType: "sting" } },
  { id: "bb-combat-lo", type: "musicState", position: { x: 1392, y: 120 }, data: { label: "Mild Splashing", intensity: 65, looping: true, stems: ["perc_waterfall_slam", "brass_rapids_rage", "strings_undertow", "synth_splash_aggro"], asset: "mus_brook_tranquil_fury_combat_lo", status: "review", jiraTicket: "JOUR-205" } },
  { id: "bb-combat-hi", type: "musicState", position: { x: 1392, y: 420 }, data: { label: "Aggressive Hydration", intensity: 95, looping: true, stems: ["perc_waterfall_slam", "brass_tsunami_embrace", "choir_drowning_harmonies", "synth_splash_aggro", "fish_slap_rhythmic"], asset: "mus_brook_tranquil_fury_combat_hi", directorNote: "The rhythmic fish slapping stem is non-negotiable. It tested well. Do not remove the fish slapping.", status: "wip", jiraTicket: "JOUR-206" } },
  { id: "bb-param-moisture", type: "parameter", position: { x: 960, y: 795 }, data: { label: "MoistureLevel", paramName: "RTPC_MoistureLevel", minValue: 0, maxValue: 100, defaultValue: 30, description: "Driven by water proximity and fish aggression. At 100, the player is fully submerged and the reverb goes cathedral. The fish own you now.", status: "approved" } },
  { id: "bb-trans-to-explore", type: "transition", position: { x: 1760, y: 300 }, data: { label: "→ Babbling", duration: 5000, syncPoint: "next-bar", fadeType: "bridge" } },
  { id: "bb-stinger-fish", type: "stinger", position: { x: 1392, y: 705 }, data: { label: "Fish Attack", trigger: "OnAggressiveFishPet", asset: "mus_brook_stinger_aggressive_fish", priority: "critical", status: "review" } },
  { id: "bb-stinger-waterfall", type: "stinger", position: { x: 544, y: 795 }, data: { label: "Waterfall Found", trigger: "OnWaterfallApproach", asset: "mus_brook_stinger_waterfall_discovery", priority: "high" } },
  { id: "bb-ending", type: "musicState", position: { x: 1760, y: 600 }, data: { label: "Cranberry Sunset", intensity: 45, looping: false, stems: ["strings_spa_closing", "flute_farewell_damp", "water_musical_drain"], asset: "mus_brook_ending_cranberry_sunset", status: "wip", jiraTicket: "JOUR-210" } },
  { id: "bb-event-qte-fish", type: "event", position: { x: 96, y: 675 }, data: { label: "Aggressive Fish Petting", eventType: "qte", blueprintRef: "BP_QTE_FishPetting_01", description: "QTE sequence: player must pet increasingly hostile fish. Each pet is more aggressive than the last. The final fish requires a running start.", directorNote: "Every QTE button prompt needs a wet slap sound. The music should crescendo with each successful pet. Failed pets should trigger a comedic tuba hit.", status: "approved" } },
  { id: "bb-event-waterfall-igc", type: "event", position: { x: 1392, y: 900 }, data: { label: "Waterfall Revelation", eventType: "igc", blueprintRef: "BP_IGC_WaterfallSecret_01", description: "In-game cutscene: the waterfall parts to reveal a hidden grotto full of ancient fish bones arranged in a threatening pattern" } },
  { id: "bb-event-checkpoint-bridge", type: "event", position: { x: 1760, y: 900 }, data: { label: "Soggy Bridge Checkpoint", eventType: "checkpoint", blueprintRef: "BP_Checkpoint_SoggyBridge", description: "Auto-save at the rickety bridge over the cranberry-colored rapids", status: "review", jiraTicket: "JOUR-212" } },
];

const babblingBrookEdges: Edge[] = [
  { id: "e-bb-1", source: "bb-intro", target: "bb-explore", animated: true, label: "Auto" },
  { id: "e-bb-2", source: "bb-explore", target: "bb-trans-to-stealth", animated: true, label: "Fish detected nearby" },
  { id: "e-bb-3", source: "bb-trans-to-stealth", target: "bb-stealth", animated: true },
  { id: "e-bb-4", source: "bb-stealth", target: "bb-trans-to-combat", animated: true, label: "Moisture > 80" },
  { id: "e-bb-5", source: "bb-explore", target: "bb-trans-to-combat", animated: true, label: "Fish provoked" },
  { id: "e-bb-6", source: "bb-trans-to-combat", target: "bb-combat-lo", animated: true },
  { id: "e-bb-7", source: "bb-combat-lo", target: "bb-combat-hi", animated: true, label: "Moisture > 70", style: { stroke: "#e94560" } },
  { id: "e-bb-8", source: "bb-combat-hi", target: "bb-combat-lo", animated: true, label: "Moisture < 40", style: { stroke: "#4ecdc4" } },
  { id: "e-bb-9", source: "bb-combat-lo", target: "bb-trans-to-explore", animated: true, label: "Fish appeased" },
  { id: "e-bb-10", source: "bb-trans-to-explore", target: "bb-explore", animated: true },
  { id: "e-bb-11", source: "bb-combat-hi", target: "bb-ending", animated: true, label: "Alpha Fish defeated" },
  { id: "e-bb-12", source: "bb-event-qte-fish", target: "bb-combat-hi", animated: true, label: "Fish petting escalates", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-bb-13", source: "bb-event-waterfall-igc", target: "bb-ending", animated: true, label: "Secret revealed", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-bb-14", source: "bb-ending", target: "bb-event-checkpoint-bridge", animated: true, label: "Auto-save", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

// ─── LEVEL 3: THE TRANQUIL GARDENS OF UNSPEAKABLE HORROR ────────────────────

const tranquilGardensAssets: MusicAsset[] = [
  { id: "a-tg-01", filename: "mus_garden_petal_of_dread_intro", category: "intro", duration: "0:26", bpm: 82, key: "Bbm", stems: ["music_box_sinister", "strings_thorny", "wind_chime_threatening"], audioFile: "journey2/mus_garden_zen_annihilation_ambient.mp3" },
  { id: "a-tg-02", filename: "mus_garden_existential_dread_loop", category: "loop", duration: "2:16", bpm: 82, key: "Bbm", stems: ["harp_wilting", "flute_photosynthesis", "bass_root_system", "perc_falling_petals"], audioFile: "journey2/mus_garden_horror_blossom_explore.mp3" },
  { id: "a-tg-03", filename: "mus_garden_violent_meditation_puzzle", category: "loop", duration: "1:28", bpm: 82, key: "Bbm", stems: ["music_box_contemplative_rage", "synth_zen_fury", "bass_deep_breath"], audioFile: "journey2/mus_garden_zen_annihilation_ambient.mp3" },
  { id: "a-tg-04", filename: "mus_garden_aggressive_yoga_combat_lo", category: "loop", duration: "1:04", bpm: 138, key: "Bbm", stems: ["perc_compost_slam", "brass_thorns", "strings_vine_whip", "synth_chlorophyll_rage"], audioFile: "journey2/mus_garden_petal_destruction_combat.mp3" },
  { id: "a-tg-05", filename: "mus_garden_aggressive_yoga_combat_hi", category: "loop", duration: "1:04", bpm: 138, key: "Bbm", stems: ["perc_compost_slam", "brass_thorns", "choir_photosynthetic_screaming", "synth_chlorophyll_rage", "taiko_tree_trunk"], audioFile: "journey2/mus_garden_petal_destruction_combat.mp3" },
  { id: "a-tg-06", filename: "mus_garden_transition_peace_to_pruning", category: "transition", duration: "0:04", bpm: 138, key: "Bbm", stems: ["vine_snap_tuned", "perc_soil_eruption"], audioFile: "transition_sweep.mp3" },
  { id: "a-tg-07", filename: "mus_garden_transition_pruning_to_peace", category: "transition", duration: "0:06", bpm: 82, key: "Bbm", stems: ["chime_regrowth", "strings_compost_settle"], audioFile: "transition_sweep.mp3" },
  { id: "a-tg-08", filename: "mus_garden_stinger_flower_punch", category: "stinger", duration: "0:03", bpm: 138, key: "Bbm", stems: ["petal_explosion_pitched", "brass_botanical_fury"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-tg-09", filename: "mus_garden_stinger_secret_seed", category: "stinger", duration: "0:04", bpm: 82, key: "Bbm", stems: ["choir_germination_awe", "harp_sprout_cascade"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-tg-10", filename: "mus_garden_ending_mulch_requiem", category: "ending", duration: "0:18", bpm: 82, key: "Bbm", stems: ["strings_autumn_acceptance", "flute_final_bloom", "wind_chime_memorial"], audioFile: "journey2/stinger_chapter_complete.mp3" },
  { id: "a-tg-11", filename: "mus_garden_layer_greenhouse_amb", category: "layer", duration: "4:00", bpm: 0, key: "-", stems: ["drone_fertile_dread", "insect_buzz_melodic"], audioFile: "journey2/mus_garden_horror_blossom_explore.mp3" },
  { id: "a-tg-12", filename: "mus_garden_layer_pollen_cloud", category: "ambient", duration: "4:00", bpm: 0, key: "-", stems: ["shimmer_allergenic", "sneeze_reverb_tuned"], audioFile: "journey2/mus_garden_zen_annihilation_ambient.mp3" },
];

const tranquilGardensNodes: Node[] = [
  { id: "tg-intro", type: "musicState", position: { x: 96, y: 360 }, data: { label: "Garden Gate", intensity: 15, looping: false, stems: ["music_box_sinister", "strings_thorny", "wind_chime_threatening"], asset: "mus_garden_petal_of_dread_intro", status: "wip", jiraTicket: "JOUR-301" } },
  { id: "tg-explore", type: "musicState", position: { x: 544, y: 240 }, data: { label: "Existential Stroll", intensity: 30, looping: true, stems: ["harp_wilting", "flute_photosynthesis", "bass_root_system", "perc_falling_petals"], asset: "mus_garden_existential_dread_loop", status: "temp" } },
  { id: "tg-trans-to-puzzle", type: "transition", position: { x: 544, y: 570 }, data: { label: "→ Meditation", duration: 3000, syncPoint: "next-bar", fadeType: "crossfade", status: "placeholder", jiraTicket: "JOUR-303" } },
  { id: "tg-puzzle", type: "musicState", position: { x: 960, y: 570 }, data: { label: "Violent Meditation", intensity: 25, looping: true, stems: ["music_box_contemplative_rage", "synth_zen_fury", "bass_deep_breath"], asset: "mus_garden_violent_meditation_puzzle", directorNote: "Every petal that falls should feel like a small death. Because it literally is. The puzzle stems should evolve — each solved step adds a layer of barely-contained botanical fury.", status: "wip" } },
  { id: "tg-trans-to-combat", type: "transition", position: { x: 960, y: 240 }, data: { label: "→ Aggressive Yoga", duration: 2000, syncPoint: "immediate", fadeType: "sting" } },
  { id: "tg-combat-lo", type: "musicState", position: { x: 1392, y: 120 }, data: { label: "Light Pruning", intensity: 65, looping: true, stems: ["perc_compost_slam", "brass_thorns", "strings_vine_whip", "synth_chlorophyll_rage"], asset: "mus_garden_aggressive_yoga_combat_lo", status: "blocked", jiraTicket: "JOUR-306" } },
  { id: "tg-combat-hi", type: "musicState", position: { x: 1392, y: 420 }, data: { label: "Full Deforestation", intensity: 95, looping: true, stems: ["perc_compost_slam", "brass_thorns", "choir_photosynthetic_screaming", "synth_chlorophyll_rage", "taiko_tree_trunk"], asset: "mus_garden_aggressive_yoga_combat_hi", directorNote: "The flowers have had enough. The choir should sound like a greenhouse that has achieved sentience and is furious about it. Think Gregorian chant meets compost heap.", status: "temp", jiraTicket: "JOUR-307" } },
  { id: "tg-param-pollen", type: "parameter", position: { x: 96, y: 645 }, data: { label: "PollenDensity", paramName: "RTPC_ExistentialDread", minValue: 0, maxValue: 100, defaultValue: 15, description: "Driven by flower destruction count and proximity to the Garden Heart. At 100, the allergies become the real enemy. Drives sneeze-reverb ambient layer.", status: "wip" } },
  { id: "tg-stinger-flower", type: "stinger", position: { x: 960, y: 810 }, data: { label: "Flower Punched", trigger: "OnFlowerPunch", asset: "mus_garden_stinger_flower_punch", priority: "critical", status: "placeholder" } },
  { id: "tg-stinger-seed", type: "stinger", position: { x: 544, y: 810 }, data: { label: "Secret Seed", trigger: "OnSecretSeedFound", asset: "mus_garden_stinger_secret_seed", priority: "medium" } },
  { id: "tg-ending", type: "musicState", position: { x: 1760, y: 360 }, data: { label: "Mulch Requiem", intensity: 30, looping: false, stems: ["strings_autumn_acceptance", "flute_final_bloom", "wind_chime_memorial"], asset: "mus_garden_ending_mulch_requiem", status: "blocked", jiraTicket: "JOUR-311" } },
  { id: "tg-event-floral-revenge", type: "event", position: { x: 96, y: 840 }, data: { label: "The Flowers Fight Back", eventType: "scripted_sequence", blueprintRef: "BP_ScriptedSeq_FloralRevenge_01", description: "Scripted sequence: the garden springs to life, vines erupt from the soil, and a massive sunflower turns to face the player with malicious intent", status: "temp" } },
  { id: "tg-event-topiary-igc", type: "event", position: { x: 1392, y: 705 }, data: { label: "Topiary Boss Reveal", eventType: "igc", blueprintRef: "BP_IGC_TopiaryAwakening_01", description: "In-game cutscene: a decorative hedge sculpture peels itself off its frame and assumes a combat stance. It was shaped like a bunny. It is no longer cute.", status: "wip", jiraTicket: "JOUR-313" } },
  { id: "tg-event-checkpoint-greenhouse", type: "event", position: { x: 1760, y: 705 }, data: { label: "Greenhouse Checkpoint", eventType: "checkpoint", blueprintRef: "BP_Checkpoint_GreenhouseSafe", description: "The only room in the garden where the plants have been pre-defeated. Safe to save." } },
];

const tranquilGardensEdges: Edge[] = [
  { id: "e-tg-1", source: "tg-intro", target: "tg-explore", animated: true, label: "Auto" },
  { id: "e-tg-2", source: "tg-explore", target: "tg-trans-to-puzzle", animated: true, label: "Enter hedge maze" },
  { id: "e-tg-3", source: "tg-trans-to-puzzle", target: "tg-puzzle", animated: true },
  { id: "e-tg-4", source: "tg-puzzle", target: "tg-explore", animated: true, label: "Solved (alive)" },
  { id: "e-tg-5", source: "tg-explore", target: "tg-trans-to-combat", animated: true, label: "Flower aggro" },
  { id: "e-tg-6", source: "tg-puzzle", target: "tg-trans-to-combat", animated: true, label: "Hedge maze betrayal" },
  { id: "e-tg-7", source: "tg-trans-to-combat", target: "tg-combat-lo", animated: true },
  { id: "e-tg-8", source: "tg-combat-lo", target: "tg-combat-hi", animated: true, label: "Dread > 70", style: { stroke: "#e94560" } },
  { id: "e-tg-9", source: "tg-combat-hi", target: "tg-combat-lo", animated: true, label: "Dread < 35", style: { stroke: "#4ecdc4" } },
  { id: "e-tg-10", source: "tg-combat-lo", target: "tg-explore", animated: true, label: "Flowers composted" },
  { id: "e-tg-11", source: "tg-combat-hi", target: "tg-ending", animated: true, label: "Topiary destroyed" },
  { id: "e-tg-12", source: "tg-event-floral-revenge", target: "tg-trans-to-combat", animated: true, label: "Plants attack", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-tg-13", source: "tg-event-topiary-igc", target: "tg-combat-hi", animated: true, label: "Boss revealed", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

// ─── LEVEL 4: CLOUD NINE THOUSAND WAYS TO DIE ──────────────────────────────

const cloudNineAssets: MusicAsset[] = [
  { id: "a-cn-01", filename: "mus_cloud_heavens_waiting_room_intro", category: "intro", duration: "0:30", bpm: 92, key: "Em", stems: ["choir_angelic_threat", "harp_cumulus", "synth_celestial_menace"], audioFile: "journey2/mus_cloud_fluffy_death_explore.mp3" },
  { id: "a-cn-02", filename: "mus_cloud_chainsaw_lullaby_loop", category: "loop", duration: "2:04", bpm: 92, key: "Em", stems: ["harp_cirrus_drift", "flute_stratosphere", "bass_cloud_density", "perc_raindrop_march"], audioFile: "journey2/mus_cloud_chainsaw_lullaby_combat.mp3" },
  { id: "a-cn-03", filename: "mus_cloud_nimbus_of_regret_loop", category: "loop", duration: "2:04", bpm: 92, key: "Em", stems: ["synth_fog_of_war", "strings_altitude_sickness", "bass_turbulence"], audioFile: "journey2/mus_cloud_fluffy_death_explore.mp3" },
  { id: "a-cn-04", filename: "mus_cloud_freefall_of_friendship_combat_lo", category: "loop", duration: "1:00", bpm: 148, key: "Em", stems: ["perc_thunder_tribal", "brass_lightning_bolt", "strings_terminal_velocity", "synth_wind_shear"], audioFile: "journey2/mus_cloud_chainsaw_lullaby_combat.mp3" },
  { id: "a-cn-05", filename: "mus_cloud_freefall_of_friendship_combat_hi", category: "loop", duration: "1:00", bpm: 148, key: "Em", stems: ["perc_thunder_tribal", "brass_lightning_full", "choir_falling_angels", "synth_wind_shear", "organ_cloud_cathedral"], audioFile: "journey2/mus_cloud_chainsaw_lullaby_combat.mp3" },
  { id: "a-cn-06", filename: "mus_cloud_transition_drift_to_plummet", category: "transition", duration: "0:03", bpm: 148, key: "Em", stems: ["thunder_crack_tuned", "choir_gasp_descending"], audioFile: "transition_sweep.mp3" },
  { id: "a-cn-07", filename: "mus_cloud_transition_plummet_to_drift", category: "transition", duration: "0:06", bpm: 92, key: "Em", stems: ["harp_ascending_relief", "wind_gentling"], audioFile: "transition_sweep.mp3" },
  { id: "a-cn-08", filename: "mus_cloud_stinger_cloud_betrayal", category: "stinger", duration: "0:03", bpm: 92, key: "Em", stems: ["cloud_dissolve_pitched", "brass_trust_issues"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-cn-09", filename: "mus_cloud_stinger_angel_rage", category: "stinger", duration: "0:02", bpm: 148, key: "Em", stems: ["choir_furious_divine", "perc_halo_throw"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-cn-10", filename: "mus_cloud_ending_gentle_landing_of_doom", category: "ending", duration: "0:16", bpm: 92, key: "Em", stems: ["strings_parachute_prayer", "harp_ground_approach", "choir_soft_impact"], audioFile: "journey2/stinger_chapter_complete.mp3" },
  { id: "a-cn-11", filename: "mus_cloud_layer_stratosphere_amb", category: "layer", duration: "4:00", bpm: 0, key: "-", stems: ["drone_altitude", "wind_singing_threats"], audioFile: "journey2/mus_cloud_fluffy_death_explore.mp3" },
  { id: "a-cn-12", filename: "mus_cloud_layer_angel_whispers", category: "ambient", duration: "4:00", bpm: 0, key: "-", stems: ["whisper_divine_passive_aggression", "feather_rustle_ominous"], audioFile: "journey2/mus_cloud_fluffy_death_explore.mp3" },
];

const cloudNineNodes: Node[] = [
  { id: "cn-intro", type: "musicState", position: { x: 96, y: 390 }, data: { label: "Heaven's Lobby", intensity: 20, looping: false, stems: ["choir_angelic_threat", "harp_cumulus", "synth_celestial_menace"], asset: "mus_cloud_heavens_waiting_room_intro", directorNote: "The clouds should part like the Red Sea. Then close again. On you.", status: "wip", jiraTicket: "JOUR-401" } },
  { id: "cn-explore-1", type: "musicState", position: { x: 544, y: 210 }, data: { label: "Chainsaw Lullaby", intensity: 30, looping: true, stems: ["harp_cirrus_drift", "flute_stratosphere", "bass_cloud_density", "perc_raindrop_march"], asset: "mus_cloud_chainsaw_lullaby_loop", status: "temp" } },
  { id: "cn-explore-2", type: "musicState", position: { x: 544, y: 570 }, data: { label: "Nimbus of Regret", intensity: 35, looping: true, stems: ["synth_fog_of_war", "strings_altitude_sickness", "bass_turbulence"], asset: "mus_cloud_nimbus_of_regret_loop", status: "temp", jiraTicket: "JOUR-403" } },
  { id: "cn-trans-to-combat", type: "transition", position: { x: 992, y: 180 }, data: { label: "→ Freefall", duration: 3000, syncPoint: "next-bar", fadeType: "crossfade" } },
  { id: "cn-combat-lo", type: "musicState", position: { x: 1408, y: 120 }, data: { label: "Mild Turbulence", intensity: 65, looping: true, stems: ["perc_thunder_tribal", "brass_lightning_bolt", "strings_terminal_velocity", "synth_wind_shear"], asset: "mus_cloud_freefall_of_friendship_combat_lo", status: "wip" } },
  { id: "cn-combat-hi", type: "musicState", position: { x: 1408, y: 420 }, data: { label: "Catastrophic Turbulence", intensity: 95, looping: true, stems: ["perc_thunder_tribal", "brass_lightning_full", "choir_falling_angels", "synth_wind_shear", "organ_cloud_cathedral"], asset: "mus_cloud_freefall_of_friendship_combat_hi", directorNote: "The falling angel choir should sound like a church choir that just realized the floor is gone. Majestic yet deeply concerned. The organ should feel like it's also falling.", status: "temp", jiraTicket: "JOUR-406" } },
  { id: "cn-param-altitude", type: "parameter", position: { x: 1408, y: 705 }, data: { label: "Altitude", paramName: "RTPC_CloudTrust", minValue: 0, maxValue: 100, defaultValue: 50, description: "Driven by how many clouds have betrayed the player (collapsed underfoot). Starts at 50 (trusting). Decreases with each betrayal. At 0, all clouds are enemies.", status: "wip" } },
  { id: "cn-trans-to-explore", type: "transition", position: { x: 992, y: 510 }, data: { label: "→ Drift", duration: 6000, syncPoint: "next-bar", fadeType: "bridge" } },
  { id: "cn-stinger-betray", type: "stinger", position: { x: 544, y: 840 }, data: { label: "Cloud Betrayal", trigger: "OnCloudBetray", asset: "mus_cloud_stinger_cloud_betrayal", priority: "high", status: "temp" } },
  { id: "cn-stinger-angel", type: "stinger", position: { x: 992, y: 840 }, data: { label: "Angel Aggro", trigger: "OnAngelRage", asset: "mus_cloud_stinger_angel_rage", priority: "critical", status: "wip", jiraTicket: "JOUR-409" } },
  { id: "cn-ending", type: "musicState", position: { x: 1824, y: 390 }, data: { label: "Gentle Landing of Doom", intensity: 40, looping: false, stems: ["strings_parachute_prayer", "harp_ground_approach", "choir_soft_impact"], asset: "mus_cloud_ending_gentle_landing_of_doom", status: "temp" } },
  { id: "cn-event-angels-cinematic", type: "event", position: { x: 96, y: 120 }, data: { label: "Angels With Anger Issues", eventType: "cinematic", blueprintRef: "BP_CinematicTrigger_AngryAngels", description: "Full cinematic: the clouds part to reveal a host of angels. They look serene. Then one cracks its knuckles. The halos start spinning like saw blades.", directorNote: "The halo spin-up sound needs to sync with the brass hit at bar 4. The angels' expressions should shift from beatific to murderous exactly on the choir's key change.", status: "temp", jiraTicket: "JOUR-411" } },
  { id: "cn-event-cloud-qte", type: "event", position: { x: 992, y: 80 }, data: { label: "Cloud Surfing QTE", eventType: "qte", blueprintRef: "BP_QTE_CloudSurf_01", description: "QTE sequence: player must surf across dissolving clouds while angels throw halos. Miss a jump and you fall through a cloud that was supposed to be solid." } },
  { id: "cn-event-checkpoint-nimbus", type: "event", position: { x: 1824, y: 80 }, data: { label: "Stable Cloud Checkpoint", eventType: "checkpoint", blueprintRef: "BP_Checkpoint_StableNimbus", description: "The one cloud that has signed a legally binding contract not to dissolve. Auto-save here.", status: "wip" } },
];

const cloudNineEdges: Edge[] = [
  { id: "e-cn-1", source: "cn-intro", target: "cn-explore-1", animated: true, label: "Auto" },
  { id: "e-cn-2", source: "cn-intro", target: "cn-explore-2", animated: true, label: "Cloud jealousy", style: { strokeDasharray: "5 5" } },
  { id: "e-cn-3", source: "cn-explore-1", target: "cn-trans-to-combat", animated: true },
  { id: "e-cn-4", source: "cn-explore-2", target: "cn-trans-to-combat", animated: true },
  { id: "e-cn-5", source: "cn-trans-to-combat", target: "cn-combat-lo", animated: true },
  { id: "e-cn-6", source: "cn-combat-lo", target: "cn-combat-hi", animated: true, label: "Trust < 30", style: { stroke: "#e94560" } },
  { id: "e-cn-7", source: "cn-combat-hi", target: "cn-combat-lo", animated: true, label: "Trust > 60", style: { stroke: "#4ecdc4" } },
  { id: "e-cn-8", source: "cn-combat-lo", target: "cn-trans-to-explore", animated: true, label: "Angels appeased" },
  { id: "e-cn-9", source: "cn-trans-to-explore", target: "cn-explore-1", animated: true },
  { id: "e-cn-10", source: "cn-combat-hi", target: "cn-ending", animated: true, label: "Archangel grounded" },
  { id: "e-cn-11", source: "cn-event-angels-cinematic", target: "cn-intro", animated: true, label: "Cinematic ends", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-cn-12", source: "cn-event-cloud-qte", target: "cn-trans-to-combat", animated: true, label: "QTE triggers freefall", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-cn-13", source: "cn-ending", target: "cn-event-checkpoint-nimbus", animated: true, label: "Auto-save", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

// ─── LEVEL 5: THE SUNSET VISTA OF TOTAL ANNIHILATION ────────────────────────

const sunsetVistaAssets: MusicAsset[] = [
  { id: "a-sv-01", filename: "mus_sunset_last_beautiful_thing_intro", category: "intro", duration: "0:34", bpm: 78, key: "Cm", stems: ["choir_doomsday_serenade", "strings_lament_gorgeous", "bell_apocalypse_toll"], audioFile: "journey2/mus_sunset_golden_apocalypse_explore.mp3" },
  { id: "a-sv-02", filename: "mus_sunset_scorched_earth_lullaby_loop", category: "loop", duration: "2:32", bpm: 78, key: "Cm", stems: ["strings_volcanic_romance", "harp_ember_drift", "synth_magma_glow", "perc_ash_fall"], audioFile: "journey2/mus_sunset_golden_apocalypse_explore.mp3" },
  { id: "a-sv-03", filename: "mus_sunset_warm_embrace_of_death_combat_lo", category: "loop", duration: "1:16", bpm: 155, key: "Cm", stems: ["taiko_eruption", "brass_lava_surge", "strings_heat_death", "synth_molten_bass"], audioFile: "journey2/mus_sunset_thermonuclear_sunset_combat.mp3" },
  { id: "a-sv-04", filename: "mus_sunset_warm_embrace_of_death_combat_hi", category: "loop", duration: "1:16", bpm: 155, key: "Cm", stems: ["taiko_eruption", "brass_orbital_bombardment", "choir_beautiful_suffering", "synth_molten_bass", "organ_volcano_cathedral"], audioFile: "journey2/mus_sunset_thermonuclear_sunset_combat.mp3" },
  { id: "a-sv-05", filename: "mus_sunset_romantic_destruction_boss_intro", category: "intro", duration: "0:16", bpm: 155, key: "Cm", stems: ["choir_nicholas_sparks_doom", "brass_sunset_cannon", "perc_earth_crack"], audioFile: "journey2/mus_journey2_boss_theme.mp3" },
  { id: "a-sv-06", filename: "mus_sunset_romantic_destruction_boss_p1", category: "loop", duration: "1:44", bpm: 155, key: "Cm", stems: ["everything_phase1_scorched"], audioFile: "journey2/mus_journey2_boss_theme.mp3" },
  { id: "a-sv-07", filename: "mus_sunset_romantic_destruction_boss_p2", category: "loop", duration: "1:44", bpm: 170, key: "Cm", stems: ["everything_phase2_annihilation"], audioFile: "journey2/mus_journey2_boss_theme.mp3" },
  { id: "a-sv-08", filename: "mus_sunset_transition_beauty_to_bombardment", category: "transition", duration: "0:04", bpm: 155, key: "Cm", stems: ["volcano_rumble_tuned", "brass_doom_swell"], audioFile: "transition_sweep.mp3" },
  { id: "a-sv-09", filename: "mus_sunset_stinger_dramatic_point", category: "stinger", duration: "0:05", bpm: 78, key: "Cm", stems: ["strings_dramatic_gesture", "choir_behold", "wind_epic_gust"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-sv-10", filename: "mus_sunset_stinger_lava_geyser", category: "stinger", duration: "0:03", bpm: 155, key: "Cm", stems: ["brass_geyser_blast", "perc_magma_burst"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-sv-11", filename: "mus_sunset_ending_beautiful_devastation", category: "ending", duration: "0:22", bpm: 78, key: "Cm", stems: ["strings_last_sunset", "choir_gorgeous_ruin", "bell_fading_hope", "harp_ash_to_ash"], audioFile: "journey2/stinger_chapter_complete.mp3" },
  { id: "a-sv-12", filename: "mus_sunset_layer_volcanic_amb", category: "layer", duration: "4:00", bpm: 0, key: "-", stems: ["drone_magma_romantic", "ember_crackle_musical", "heat_shimmer_dreamy"], audioFile: "journey2/mus_sunset_golden_apocalypse_explore.mp3" },
];

const sunsetVistaNodes: Node[] = [
  { id: "sv-intro", type: "musicState", position: { x: 96, y: 360 }, data: { label: "Vista Approach", intensity: 25, looping: false, stems: ["choir_doomsday_serenade", "strings_lament_gorgeous", "bell_apocalypse_toll"], asset: "mus_sunset_last_beautiful_thing_intro", directorNote: "This should feel like the end of a Nicholas Sparks movie. If Nicholas Sparks wrote about orbital bombardment.", status: "placeholder", jiraTicket: "JOUR-501" } },
  { id: "sv-explore", type: "musicState", position: { x: 544, y: 360 }, data: { label: "Scorched Earth Lullaby", intensity: 40, looping: true, stems: ["strings_volcanic_romance", "harp_ember_drift", "synth_magma_glow", "perc_ash_fall"], asset: "mus_sunset_scorched_earth_lullaby_loop", status: "temp" } },
  { id: "sv-trans-to-combat", type: "transition", position: { x: 960, y: 180 }, data: { label: "→ Warm Embrace", duration: 4000, syncPoint: "next-bar", fadeType: "crossfade" } },
  { id: "sv-combat-lo", type: "musicState", position: { x: 1376, y: 90 }, data: { label: "Warm Embrace (Light)", intensity: 70, looping: true, stems: ["taiko_eruption", "brass_lava_surge", "strings_heat_death", "synth_molten_bass"], asset: "mus_sunset_warm_embrace_of_death_combat_lo", status: "placeholder", jiraTicket: "JOUR-504" } },
  { id: "sv-combat-hi", type: "musicState", position: { x: 1376, y: 360 }, data: { label: "Warm Embrace (Fatal)", intensity: 90, looping: true, stems: ["taiko_eruption", "brass_orbital_bombardment", "choir_beautiful_suffering", "synth_molten_bass", "organ_volcano_cathedral"], asset: "mus_sunset_warm_embrace_of_death_combat_hi", status: "blocked", jiraTicket: "JOUR-505" } },
  { id: "sv-boss-intro", type: "musicState", position: { x: 960, y: 600 }, data: { label: "Romantic Destruction", intensity: 80, looping: false, stems: ["choir_nicholas_sparks_doom", "brass_sunset_cannon", "perc_earth_crack"], asset: "mus_sunset_romantic_destruction_boss_intro", directorNote: "Two seconds of the most beautiful sunset the player has ever seen. Then the volcano opens an eye. Yes, the volcano has an eye now. We're past the point of subtlety.", status: "temp" } },
  { id: "sv-boss-p1", type: "musicState", position: { x: 1376, y: 630 }, data: { label: "Volcano Phase 1", intensity: 90, looping: true, stems: ["everything_phase1_scorched"], asset: "mus_sunset_romantic_destruction_boss_p1", status: "placeholder" } },
  { id: "sv-boss-p2", type: "musicState", position: { x: 1760, y: 630 }, data: { label: "Volcano Phase 2", intensity: 100, looping: true, stems: ["everything_phase2_annihilation"], asset: "mus_sunset_romantic_destruction_boss_p2", status: "blocked", jiraTicket: "JOUR-508" } },
  { id: "sv-param-heat", type: "parameter", position: { x: 96, y: 630 }, data: { label: "SunsetBeauty", paramName: "RTPC_SunsetBeauty", minValue: 0, maxValue: 100, defaultValue: 80, description: "Paradoxically, beauty increases with destruction. More lava = more beautiful sunset. At 100, the sky is on fire and it's gorgeous and everything is dying.", status: "temp" } },
  { id: "sv-stinger-point", type: "stinger", position: { x: 544, y: 750 }, data: { label: "Dramatic Pointing", trigger: "OnSunsetPoint", asset: "mus_sunset_stinger_dramatic_point", priority: "high" } },
  { id: "sv-stinger-geyser", type: "stinger", position: { x: 960, y: 840 }, data: { label: "Lava Geyser", trigger: "OnLavaGeyserErupt", asset: "mus_sunset_stinger_lava_geyser", priority: "critical", status: "placeholder", jiraTicket: "JOUR-511" } },
  { id: "sv-ending", type: "musicState", position: { x: 1760, y: 360 }, data: { label: "Beautiful Devastation", intensity: 35, looping: false, stems: ["strings_last_sunset", "choir_gorgeous_ruin", "bell_fading_hope", "harp_ash_to_ash"], asset: "mus_sunset_ending_beautiful_devastation", directorNote: "The ending should make the player cry. From beauty, from sadness, from the sheer volume of lava they just survived. All three simultaneously.", status: "placeholder" } },
  { id: "sv-event-qte-sunset", type: "event", position: { x: 544, y: 930 }, data: { label: "Dramatic Sunset Pointing", eventType: "qte", blueprintRef: "BP_QTE_SunsetPoint_01", description: "QTE: The player must dramatically point at the sunset at exactly the right moment. Too early and the sun hasn't set enough. Too late and the volcano blocks the view. There is a 0.3 second window. This is the hardest QTE in the game.", directorNote: "The orchestral swell must peak at the exact frame the player's finger reaches full extension. We have 0.3 seconds. This is our Sistine Chapel moment." } },
  { id: "sv-event-volcano-cinematic", type: "event", position: { x: 96, y: 840 }, data: { label: "Volcano Awakens", eventType: "cinematic", blueprintRef: "BP_CinematicTrigger_VolcanoEye", description: "Cinematic: the volcano opens a single massive eye. A tear of lava rolls down its slope. It's beautiful and terrifying.", status: "temp", jiraTicket: "JOUR-514" } },
  { id: "sv-event-checkpoint-ridge", type: "event", position: { x: 1760, y: 840 }, data: { label: "Obsidian Ridge Checkpoint", eventType: "checkpoint", blueprintRef: "BP_Checkpoint_ObsidianRidge", description: "Checkpoint on the cooled obsidian ridge. Everything around you is still on fire but this specific spot is fine." } },
];

const sunsetVistaEdges: Edge[] = [
  { id: "e-sv-1", source: "sv-intro", target: "sv-explore", animated: true, label: "Auto" },
  { id: "e-sv-2", source: "sv-explore", target: "sv-trans-to-combat", animated: true },
  { id: "e-sv-3", source: "sv-trans-to-combat", target: "sv-combat-lo", animated: true },
  { id: "e-sv-4", source: "sv-combat-lo", target: "sv-combat-hi", animated: true, label: "Beauty > 65", style: { stroke: "#e94560" } },
  { id: "e-sv-5", source: "sv-combat-hi", target: "sv-combat-lo", animated: true, label: "Beauty < 35", style: { stroke: "#4ecdc4" } },
  { id: "e-sv-6", source: "sv-combat-lo", target: "sv-explore", animated: true, label: "Lava retreats" },
  { id: "e-sv-7", source: "sv-explore", target: "sv-boss-intro", animated: true, label: "Approach the eye" },
  { id: "e-sv-8", source: "sv-boss-intro", target: "sv-boss-p1", animated: true, label: "Auto" },
  { id: "e-sv-9", source: "sv-boss-p1", target: "sv-boss-p2", animated: true, label: "HP < 50%", style: { stroke: "#e94560" } },
  { id: "e-sv-10", source: "sv-boss-p2", target: "sv-ending", animated: true, label: "Volcano pacified (temporarily)" },
  { id: "e-sv-11", source: "sv-event-volcano-cinematic", target: "sv-boss-intro", animated: true, label: "Eye opens", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-sv-12", source: "sv-boss-p2", target: "sv-event-qte-sunset", animated: true, label: "Sunset window", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-sv-13", source: "sv-event-qte-sunset", target: "sv-ending", animated: true, label: "QTE success (pointed dramatically)", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

// ─── LEVEL 6: THE SUMMIT OF ETERNAL FRIENDSHIP ──────────────────────────────

const eternalSummitAssets: MusicAsset[] = [
  { id: "a-es-01", filename: "mus_summit_destroyer_of_worlds_intro", category: "intro", duration: "0:40", bpm: 90, key: "Am", stems: ["orchestra_friendship_overture", "synth_celestial_violence", "choir_ancient_bros"], audioFile: "journey2/mus_journey2_cinematic_suite.mp3" },
  { id: "a-es-02", filename: "mus_summit_companionship_and_carnage_loop", category: "loop", duration: "2:36", bpm: 90, key: "Am", stems: ["strings_noble_destruction", "harp_summit_wind", "synth_aurora_threatening", "perc_ice_crystal"], audioFile: "journey2/mus_summit_friendship_finale_explore.mp3" },
  { id: "a-es-03", filename: "mus_summit_combat_heartwarming_slaughter_lo", category: "loop", duration: "1:08", bpm: 168, key: "Am", stems: ["perc_avalanche_rhythm", "brass_mountain_fury", "strings_blizzard_passion", "synth_frost_rage"], audioFile: "journey2/mus_summit_companion_carnage_combat.mp3" },
  { id: "a-es-04", filename: "mus_summit_combat_heartwarming_slaughter_hi", category: "loop", duration: "1:08", bpm: 168, key: "Am", stems: ["perc_avalanche_rhythm", "brass_mountain_full", "choir_frozen_screaming", "synth_frost_rage", "organ_summit_cathedral"], audioFile: "journey2/mus_summit_companion_carnage_combat.mp3" },
  { id: "a-es-05", filename: "mus_summit_final_boss_convergence_intro", category: "intro", duration: "0:24", bpm: 168, key: "Am", stems: ["choir_all_scarves_unite", "orchestra_destiny_of_friendship", "synth_singularity_of_hugs"], audioFile: "journey2/mus_journey2_boss_theme.mp3" },
  { id: "a-es-06", filename: "mus_summit_final_hug_of_annihilation_boss_p1", category: "loop", duration: "2:00", bpm: 168, key: "Am", stems: ["everything_final_friendship_p1"], audioFile: "journey2/mus_journey2_boss_theme.mp3" },
  { id: "a-es-07", filename: "mus_summit_final_hug_of_annihilation_boss_p2", category: "loop", duration: "2:00", bpm: 184, key: "Am", stems: ["everything_final_friendship_p2_ascended"], audioFile: "journey2/mus_journey2_boss_theme.mp3" },
  { id: "a-es-08", filename: "mus_summit_final_hug_of_annihilation_boss_p3", category: "loop", duration: "2:00", bpm: 200, key: "Am", stems: ["everything_final_friendship_p3_transcendent_violence"], audioFile: "journey2/mus_journey2_boss_theme.mp3" },
  { id: "a-es-09", filename: "mus_summit_victory_friendship_was_violence", category: "ending", duration: "1:30", bpm: 90, key: "A", stems: ["orchestra_triumph_of_scarves", "choir_eternal_friendship", "synth_aurora_peace", "bell_never_again", "gentle_screaming"], audioFile: "journey2/mus_journey2_cinematic_suite.mp3" },
  { id: "a-es-10", filename: "mus_summit_stinger_scarf_convergence", category: "stinger", duration: "0:05", bpm: 90, key: "Am", stems: ["choir_scarf_prophecy", "brass_textile_destiny", "perc_weave_impact"], audioFile: "journey2/stinger_flute_death.mp3" },
  { id: "a-es-11", filename: "mus_summit_layer_blizzard_amb", category: "layer", duration: "4:00", bpm: 0, key: "-", stems: ["drone_mountain_loneliness", "wind_summit_howl", "ice_crack_melodic"], audioFile: "journey2/mus_summit_friendship_finale_explore.mp3" },
];

const eternalSummitNodes: Node[] = [
  { id: "es-intro", type: "musicState", position: { x: 96, y: 420 }, data: { label: "Summit Gates", intensity: 30, looping: false, stems: ["orchestra_friendship_overture", "synth_celestial_violence", "choir_ancient_bros"], asset: "mus_summit_destroyer_of_worlds_intro", directorNote: "If the player isn't weeping and also terrified, we haven't done our job. This intro should feel like every friendship you've ever had compressed into 40 seconds and then set on fire.", status: "placeholder", jiraTicket: "JOUR-601" } },
  { id: "es-explore", type: "musicState", position: { x: 544, y: 270 }, data: { label: "Companionship & Carnage", intensity: 40, looping: true, stems: ["strings_noble_destruction", "harp_summit_wind", "synth_aurora_threatening", "perc_ice_crystal"], asset: "mus_summit_companionship_and_carnage_loop", status: "temp" } },
  { id: "es-trans-to-combat", type: "transition", position: { x: 960, y: 150 }, data: { label: "→ Heartwarming Slaughter", duration: 3000, syncPoint: "next-bar", fadeType: "crossfade", status: "placeholder" } },
  { id: "es-combat-lo", type: "musicState", position: { x: 1376, y: 80 }, data: { label: "Friendly Fire", intensity: 70, looping: true, stems: ["perc_avalanche_rhythm", "brass_mountain_fury", "strings_blizzard_passion", "synth_frost_rage"], asset: "mus_summit_combat_heartwarming_slaughter_lo", status: "placeholder", jiraTicket: "JOUR-604" } },
  { id: "es-combat-hi", type: "musicState", position: { x: 1376, y: 330 }, data: { label: "Best Friends Forever (Literally)", intensity: 90, looping: true, stems: ["perc_avalanche_rhythm", "brass_mountain_full", "choir_frozen_screaming", "synth_frost_rage", "organ_summit_cathedral"], asset: "mus_summit_combat_heartwarming_slaughter_hi", status: "temp" } },
  { id: "es-boss-intro", type: "musicState", position: { x: 544, y: 630 }, data: { label: "The Convergence of Scarves", intensity: 85, looping: false, stems: ["choir_all_scarves_unite", "orchestra_destiny_of_friendship", "synth_singularity_of_hugs"], asset: "mus_summit_final_boss_convergence_intro", directorNote: "Every scarf the player has collected begins to glow and interweave. This is the culmination of the entire Journey. Callback to the Whispering Sands intro motif but now with a full orchestra of friendship and extreme violence.", status: "placeholder", jiraTicket: "JOUR-606" } },
  { id: "es-boss-p1", type: "musicState", position: { x: 960, y: 630 }, data: { label: "Final Hug P1", intensity: 90, looping: true, stems: ["everything_final_friendship_p1"], asset: "mus_summit_final_hug_of_annihilation_boss_p1", status: "temp" } },
  { id: "es-boss-p2", type: "musicState", position: { x: 1376, y: 630 }, data: { label: "Final Hug P2", intensity: 95, looping: true, stems: ["everything_final_friendship_p2_ascended"], asset: "mus_summit_final_hug_of_annihilation_boss_p2", status: "placeholder" } },
  { id: "es-boss-p3", type: "musicState", position: { x: 1760, y: 630 }, data: { label: "Final Hug P3", intensity: 100, looping: true, stems: ["everything_final_friendship_p3_transcendent_violence"], asset: "mus_summit_final_hug_of_annihilation_boss_p3", directorNote: "Everything we have. Every stem, every layer. The tempo increase to 200 BPM should feel like friendship itself accelerating beyond the speed of light. The gentle_screaming stem is mandatory. It tested extraordinarily well.", status: "placeholder", jiraTicket: "JOUR-609" } },
  { id: "es-param-friendship", type: "parameter", position: { x: 96, y: 690 }, data: { label: "FriendshipIntensity", paramName: "RTPC_FriendshipIntensity", minValue: 0, maxValue: 100, defaultValue: 0, description: "Starts at 0. Increases with every violent act of friendship. At 100, friendship has become a force of nature. Drives all combat layer crossfades and the gentle_screaming stem volume.", status: "temp" } },
  { id: "es-stinger-scarf", type: "stinger", position: { x: 96, y: 840 }, data: { label: "Scarf Convergence", trigger: "OnScarfTrip", asset: "mus_summit_stinger_scarf_convergence", priority: "critical", status: "placeholder", jiraTicket: "JOUR-611" } },
  { id: "es-victory", type: "musicState", position: { x: 1760, y: 420 }, data: { label: "Friendship Was Violence", intensity: 60, looping: false, stems: ["orchestra_triumph_of_scarves", "choir_eternal_friendship", "synth_aurora_peace", "bell_never_again", "gentle_screaming"], asset: "mus_summit_victory_friendship_was_violence", status: "placeholder" } },
  { id: "es-event-convergence-igc", type: "event", position: { x: 544, y: 900 }, data: { label: "The Convergence of Scarves", eventType: "igc", blueprintRef: "BP_IGC_ScarfConvergence_Final", description: "In-game cutscene: every scarf fragment from the entire game converges on the summit, weaving into a massive scarf tornado. It is simultaneously the most beautiful and most terrifying textile event in gaming history.", status: "temp", jiraTicket: "JOUR-613" } },
  { id: "es-event-final-qte", type: "event", position: { x: 1760, y: 900 }, data: { label: "Final Friendship Handshake", eventType: "qte", blueprintRef: "BP_QTE_FriendshipHandshake_Final", description: "The final QTE: player must execute a perfectly timed friendship handshake with their Journey companion. The handshake generates a shockwave that levels the mountain. Friendship has consequences.", directorNote: "Each button press adds a layer to the final chord. The handshake impact on the final press must sync with every instrument hitting their final note simultaneously. Then two seconds of silence. Then the gentle_screaming fades in for the credits.", status: "placeholder" } },
  { id: "es-event-checkpoint-peak", type: "event", position: { x: 96, y: 150 }, data: { label: "False Summit Checkpoint", eventType: "checkpoint", blueprintRef: "BP_Checkpoint_FalseSummit", description: "Checkpoint at what the player thinks is the summit. It is not the summit. The real summit is watching.", status: "temp" } },
];

const eternalSummitEdges: Edge[] = [
  { id: "e-es-1", source: "es-intro", target: "es-explore", animated: true, label: "Auto" },
  { id: "e-es-2", source: "es-explore", target: "es-trans-to-combat", animated: true },
  { id: "e-es-3", source: "es-trans-to-combat", target: "es-combat-lo", animated: true },
  { id: "e-es-4", source: "es-combat-lo", target: "es-combat-hi", animated: true, label: "Friendship > 60", style: { stroke: "#e94560" } },
  { id: "e-es-5", source: "es-combat-hi", target: "es-combat-lo", animated: true, label: "Friendship < 30", style: { stroke: "#4ecdc4" } },
  { id: "e-es-6", source: "es-combat-lo", target: "es-explore", animated: true, label: "Mountain forgives you" },
  { id: "e-es-7", source: "es-explore", target: "es-boss-intro", animated: true, label: "Enter the scarf vortex" },
  { id: "e-es-8", source: "es-boss-intro", target: "es-boss-p1", animated: true, label: "Auto" },
  { id: "e-es-9", source: "es-boss-p1", target: "es-boss-p2", animated: true, label: "HP < 66%", style: { stroke: "#e94560" } },
  { id: "e-es-10", source: "es-boss-p2", target: "es-boss-p3", animated: true, label: "HP < 33%", style: { stroke: "#e94560" } },
  { id: "e-es-11", source: "es-boss-p3", target: "es-victory", animated: true, label: "Friendship achieved (fatally)" },
  { id: "e-es-12", source: "es-event-convergence-igc", target: "es-boss-intro", animated: true, label: "Scarves converge", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-es-13", source: "es-boss-p3", target: "es-event-final-qte", animated: true, label: "Final handshake", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-es-14", source: "es-event-final-qte", target: "es-victory", animated: true, label: "QTE success (mountain leveled)", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
  { id: "e-es-15", source: "es-event-checkpoint-peak", target: "es-intro", animated: true, label: "False hope", style: { stroke: "#f59e0b", strokeDasharray: "3 3" } },
];

// ─── EXPORT ─────────────────────────────────────────────────────────────────

export const journey2Levels: GameLevel[] = [
  { id: "whispering-sands", name: "The Whispering Sands", subtitle: "Where Scarves Go to Die", region: "Act I \u2014 The Gentle Beginning", nodes: whisperingSandsNodes, edges: whisperingSandsEdges, assets: whisperingSandsAssets },
  { id: "babbling-brook", name: "The Babbling Brook of Devastation", subtitle: "Waters Run Red (With Cranberry Juice)", region: "Act I \u2014 The Gentle Beginning", nodes: babblingBrookNodes, edges: babblingBrookEdges, assets: babblingBrookAssets },
  { id: "tranquil-gardens", name: "The Tranquil Gardens of Unspeakable Horror", subtitle: "Stop and Smell the Carnage", region: "Act II \u2014 The Uncomfortable Middle", nodes: tranquilGardensNodes, edges: tranquilGardensEdges, assets: tranquilGardensAssets },
  { id: "cloud-nine", name: "Cloud Nine Thousand Ways to Die", subtitle: "Heaven's Waiting Room (No Appointments Available)", region: "Act II \u2014 The Uncomfortable Middle", nodes: cloudNineNodes, edges: cloudNineEdges, assets: cloudNineAssets },
  { id: "sunset-vista", name: "The Sunset Vista of Total Annihilation", subtitle: "Every Sunset is Beautiful When You're the Last One Alive", region: "Act III \u2014 The Peaceful Conclusion (Of All Life)", nodes: sunsetVistaNodes, edges: sunsetVistaEdges, assets: sunsetVistaAssets },
  { id: "eternal-summit", name: "The Summit of Eternal Friendship", subtitle: "It Was Never About the Mountain (It Was About the Violence)", region: "Act III \u2014 The Peaceful Conclusion (Of All Life)", nodes: eternalSummitNodes, edges: eternalSummitEdges, assets: eternalSummitAssets },
];
