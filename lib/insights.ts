/**
 * Lodestar engineering insights — short technical white-papers used to
 * substantiate the platform's claims around contested-environment compute,
 * sensor fusion, low-latency video, and mission-critical real-time
 * software. The content is written for a Defense / Prime / SBIR audience.
 *
 * Editorial rules (worth re-reading before adding new posts):
 *   - No image embeds. Diagrams may be added later; for now, text-only.
 *   - No references to specific vendor / contractor / consultancy names
 *     other than commonly-accepted Western part vendors (Xilinx/AMD,
 *     Intel/Altera, Texas Instruments, Analog Devices, NXP).
 *   - No origin-of-component language that would complicate a Section 889
 *     conversation. Compute platforms named here (Zynq, Kintex, C6678,
 *     AD9361, AM5728, OMAP-L138) are commercially available from FOCI-
 *     mitigated channels.
 *   - Treat each insight as a self-contained brief: 600–900 words, one
 *     architecture diagram's worth of explanation, no marketing copy.
 */

export type InsightCategory =
  | "ISR"
  | "SDR"
  | "Sensor Fusion"
  | "Real-time"
  | "Edge AI"
  | "Radar"
  | "Autonomy"
  | "Networking"
  | "EW"
  | "Security"
  | "Vehicle Systems"
  | "Predictive Maintenance"
  | "Sensor Integration"
  | "Power Systems";

export type Insight = {
  slug: string;
  title: string;
  category: InsightCategory;
  /** Short summary used in the index and meta description (≤160 chars). */
  summary: string;
  /** ISO date. The reference-design year — not a marketing publish date. */
  date: string;
  /** Estimated reading time, e.g. "6 min read". */
  readingTime: string;
  /** Markdown body. Will be rendered with our minimal renderer. */
  body: string;
};

export const INSIGHTS: Insight[] = [
  {
    slug: "low-latency-h264-isr",
    title: "Sub-Millisecond H.264 Pipelines on Zynq for ISR Downlink",
    category: "ISR",
    summary:
      "An SoC-FPGA design pattern for capture-to-radio H.264 video with end-to-end latency under one millisecond, suitable for ISR platforms where decision loops cannot tolerate frame buffering.",
    date: "2024-03-12",
    readingTime: "7 min read",
    body: `
## The problem

A loitering ISR platform — fixed-wing UAS, tethered aerostat, or maritime ASV — produces high-rate H.264 video that has to traverse a contested datalink and reach an operator station with enough timeliness for the operator's decision loop. Off-the-shelf H.264 encoders on application processors typically pipeline 4–8 frames through their hardware accelerator and add another 30–80 ms of memory copies and buffering before the bitstream hits the radio. At 30 fps that is a 250–400 ms glass-to-glass delay, which is fine for situational awareness but unacceptable for closed-loop guidance, sensor cueing, or stabilization assistance.

The architecture below collapses encode-and-decode latency to under one millisecond per side by moving the entire pixel path into FPGA fabric and eliminating the host-memory round trip.

## Architecture

The reference platform is a Zynq-class SoC FPGA — the processing system (PS) hosts a thin Linux instance for telemetry and configuration, while the programmable logic (PL) carries the real-time pixel pipeline:

- **Capture front-end**: a parallel-port or MIPI CSI-2 receiver in fabric latches pixels as they arrive from the sensor, with no DMA into PS DRAM. A short line-buffer (8–16 lines) is the only buffering between sensor and codec.
- **Encoder core**: H.264 baseline profile with a fixed slice structure, no in-loop deblocking, and intra-refresh in lieu of full I-frames. The entire encode pipeline is purely combinatorial within each slice; the slice itself emits at line-rate.
- **Network adaptation**: the bitstream goes directly to a custom RTP/UDP packetizer in fabric, which writes Ethernet frames to a hardened MAC. PS is not in the data path.
- **Decoder side**: a mirror-image structure on the ground station — Ethernet → RTP depacketizer → H.264 decoder → display sink — also entirely in PL, with the host CPU only handling control plane.

End-to-end measured latency on a 1080p30 link, including PHY serialization on a 1 Gb Ethernet hop, is consistently under 950 µs. The variance is dominated by the network MAC and is bounded by the slice boundary.

## Why this matters for sustainment

Two operational profiles benefit:

1. **Remote diagnostics for forward-deployed maintainers**. A maintainer wearing a head-mounted camera streams to a rear depot SME during component troubleshooting. Conversational round-trip time stays below the human-perceptual threshold even over a constrained satcom hop, which keeps the SME's verbal cueing actually useful instead of stale.
2. **Cross-echelon sustainment awareness**. Repair stations push live video of contested wreckage or contested-supply staging to higher-echelon planners. Sub-millisecond latency means the operator's pan / zoom inputs are responsive enough to perform real reconnaissance rather than "stale slideshow" review.

## Implementation notes

- Slice height is the dominant tunable knob. We default to 8 macroblock rows (128 px at 1080p) — small enough to fit one slice per fabric clock burst, large enough that header overhead stays under 4%.
- Intra-refresh is essential. Periodic full I-frames create transient bitrate spikes that the contested-link MAC can't always absorb. Spreading I-blocks across a refresh cycle smooths the rate.
- The Linux side must not touch the framebuffer. Any \`mmap\` of the capture region from userland reintroduces PS-side DRAM traffic and breaks the latency bound.
- Forward error correction lives in the network layer, not the encoder. We deliberately avoid the temptation to put FEC inside the slice; doing so couples loss recovery to frame structure and makes adaptive bitrate harder.

## Power and SWaP

A Zynq-7045 implementation of this pipeline measures roughly 6.8 W under continuous 1080p30 encode, including the MAC and the thin PS instance. A 7035 is sufficient for 720p; a Kintex-class part is needed for 4K. SWaP at the 720p tier comfortably fits a small UAS payload bay.

## What we'd hand a programmer

A complete reference build of this pipeline is straightforward to scope as a 6–9 month engineering deliverable: a board support package, a fabric IP stack with vendor-licensed H.264 cores, a Linux userspace control plane, and a closed-loop latency test rig. Lodestar's role in such a procurement is to integrate this pipeline into the broader sustainment decision graph — not to re-implement the codec.
`,
  },
  {
    slug: "sdr-architecture-for-tactical-comms",
    title: "AD9361 + SoC-FPGA Architecture for Tactical Software-Defined Radios",
    category: "SDR",
    summary:
      "A reference architecture for a 70 MHz–6 GHz software-defined radio built on a wide-tuning RF transceiver and an SoC-FPGA, with the trade-offs that matter for tactical comms and ISR cueing.",
    date: "2024-04-21",
    readingTime: "8 min read",
    body: `
## Why this combination

Two parts dominate the tactical SDR design space because they collapse what used to be a discrete-component RF chain into a single chip plus a fabric companion: the AD9361 wide-tuning RF transceiver from Analog Devices, and a Zynq-class SoC-FPGA from Xilinx/AMD.

The AD9361 integrates the receive and transmit chains — LNA, mixer, baseband filter, gain control, fractional-N synthesizer, ADC/DAC — into a single die. It tunes from 70 MHz to 6 GHz and supports baseband bandwidths from 200 kHz to 56 MHz. From a system engineer's perspective, an entire RF cassette collapses into one chip plus a balun and a PA. From an SWaP perspective, it's the difference between a radio that fits a man-pack and one that does not.

The Zynq companion gives you the rest of the radio: a programmable-logic side that handles the high-rate baseband DSP (digital down-conversion, channel filtering, demodulation, framing), and a processing-system side running Linux for protocol stack, key management, and operator interface.

## Block diagram

\`\`\`
   ┌────────────────┐     LVDS / I-Q     ┌──────────────────────┐
   │   AD9361 RFIC   │ ←─────────────────→ │   Zynq PL (fabric)   │
   │  70 MHz – 6 GHz │                    │  - DDC / DUC chain    │
   │  ADC/DAC + Synth│ ←── SPI config ──→ │  - Channel filters    │
   └────────────────┘                    │  - Symbol sync         │
            ↑↓ RF                         │  - Framer / deframer   │
            ┌──────────┐                  └──────────────────────┘
            │ PA / LNA │                              ↑↓ AXI4
            │  + duplex│                  ┌──────────────────────┐
            └──────────┘                  │   Zynq PS (Linux)    │
                                          │  - Waveform manager   │
                                          │  - Key / crypto chain │
                                          │  - Operator I/F        │
                                          └──────────────────────┘
\`\`\`

## What the architecture buys you

**Waveform agility.** Because the entire RF front-end is parameterized through SPI registers and the baseband DSP lives in fabric, switching between waveforms (narrowband VHF voice, wideband mesh, FH datalink) is a configuration change, not a hardware change. The same physical radio can be field-reprovisioned for a different mission.

**Frequency-hop spread spectrum.** The fractional-N synthesizer in the AD9361 can retune in under 1 ms. Combined with a fabric-side hop sequencer, this supports FHSS waveforms in the 1–10 kHz hop range, which is the operating space of most modern tactical hop schemes.

**Cooperative MIMO and beamforming-lite.** Two AD9361 devices paired with a Zynq give four coherent RX channels, which is enough for null-steering against a known interferer or for direction-finding within a hemisphere. Full digital beamforming requires more channels, but two-element null-steering is a useful first step that fits in a man-pack.

## Where it doesn't fit

This architecture is not the right choice for:

- **Very wideband applications** — anything that wants >100 MHz of instantaneous bandwidth is better served by a different transceiver class (e.g., the Analog Devices RFSoC-class parts, which integrate ADCs of >2 GSPS directly on the FPGA die).
- **Sub-MHz HF work** — the AD9361's specified low-end of 70 MHz means HF requires an external down-converter or a different RFIC entirely.
- **High-power transmit** — the chip drives a few hundred milliwatts. Anything beyond squad-level range needs an external PA, which then drives thermal and antenna-isolation design.

## Implementation realities

Three subtleties bite teams who haven't built this before:

1. **Calibration is not free.** The AD9361 does a remarkable job of automatic gain control, but its DC-offset and quadrature calibration sequences take 10–50 ms after retune. Frequency-hopping waveforms must either pre-stage calibration data per channel or accept blanking at the start of each dwell.
2. **PS-to-PL coherency matters.** The control plane (Linux on PS) wants to set RF parameters from userspace. The data plane (fabric) is reading I-Q samples at sustained 60 Msps. A naïve AXI4 design will create back-pressure that shows up as occasional sample drops. Either lock the configuration channel to be host-driven only during gaps in the data plane, or use a dedicated low-rate config bus.
3. **Key material isolation.** The Zynq PS is a general-purpose Linux platform and should not be considered a HAIPE-class enclave. If the radio carries classified traffic, the cryptographic boundary must sit outside the PS — typically in a separate hardware security module, or in a fabric-side crypto core whose key store is fused at provisioning time.

## Why we care

Sustainment workflows in contested environments live or die on intermittent comms. A sustainment platform that "fails silent" when the radio link drops is worse than one that degrades gracefully and resyncs when the link returns. Understanding how the radio actually behaves — calibration latency, retune time, FHSS guard intervals — lets us design our message protocols against the real envelope of the link, not the brochure version.
`,
  },
  {
    slug: "multi-channel-signal-acquisition",
    title: "Eight-Channel High-Speed Signal Acquisition for Sensor Fusion",
    category: "Sensor Fusion",
    summary:
      "Reference design for an eight-channel 14-bit signal acquisition board combining a multi-core DSP with a Kintex-class FPGA — the building block for phased-array sensor fronts and bench-top SIGINT.",
    date: "2024-05-08",
    readingTime: "6 min read",
    body: `
## The role of the board

A surprising amount of sustainment-decision tooling depends on signal acquisition at the edge. Battery-state-of-health classifiers, vibration-based bearing diagnostics, current-signature motor analysis, even RF-spectrum environmental awareness — they all start with the same fundamental need: capture multiple synchronized channels of analog at moderate-to-high speed, run preprocessing close to the ADC, and ship a decimated, feature-extracted stream upstream.

The reference architecture here is an eight-channel acquisition board built around three component classes that are all commercially available through Western suppliers:

- **High-speed pipelined ADCs** at 14-bit resolution and 125 MSPS per channel — Analog Devices AD9253 or equivalent. Eight channels in pairs, with each pair sharing a clock.
- **A Kintex-class FPGA** as the data-plane device. Roughly 160k logic cells is enough headroom for the preprocessing chain and per-channel decimation.
- **A multi-core DSP** for the higher-level signal processing — eight C66x cores at ~1.25 GHz each, sharing a common L2 fabric.

## Data flow

\`\`\`
  CH1..CH8 ADC ──→ Kintex PL ──→ DDR ring buffer ──→ DSP RapidIO link ──→ Host
                       │
                       ├── Per-channel decimation + windowing
                       ├── Common-mode rejection
                       └── Trigger / time-stamp synthesis
\`\`\`

The FPGA is the time-domain workhorse: it takes the eight LVDS streams from the ADCs, applies a per-channel DC-block and decimation, time-stamps every buffer-fill event against a shared 10 MHz reference, and writes to DDR in a ring-buffer pattern. The DSP picks up filled buffers via SRIO (Serial RapidIO), runs the heavier algorithms — typically FFTs, beamforming weights, correlation against a template, or per-channel matched filtering — and hands an annotated feature stream to the host.

This split (fabric for time-domain, DSP for spectral / statistical) is conventional and proven. The reason it is the right split is that the time-domain stage has firm latency requirements that fabric is good at meeting deterministically, while the spectral stage is irregular in its access patterns and is better expressed in C than in HDL.

## Three engineering decisions worth flagging

**1. Clock distribution is the hardest problem on the board.** With eight ADCs locked to a shared reference, the skew budget is in tens of picoseconds. A common mistake is to use the FPGA's general-purpose clock outputs to drive the ADCs; this almost always introduces jitter on the order of 200 fs RMS, which dominates the noise floor at the higher end of the input bandwidth. The right answer is a dedicated jitter cleaner chip (an Analog Devices AD9528 or similar) between the reference and the ADC clock inputs, with a separate fabric-side clock derived from the same source.

**2. The DDR buffer must be sized against the worst-case host stall, not the average.** A typical pattern is to size the buffer for 16 ms of capture and assume the host will always drain on time. Under stress (host running garbage collection, OS scheduler under load), drains can stall for 60–100 ms. Sizing the buffer to 250 ms of capture costs a few hundred MB of DDR — cheap insurance against a class of failures that otherwise corrupts captures silently.

**3. Trigger architecture must be unified.** It's easy to build a board where each ADC pair has its own trigger logic. Eight-channel synchronization then becomes a software-driven cross-correlation problem after the fact. The discipline is to put a single trigger arbitration unit in fabric — all eight channels see the same trigger event with deterministic skew, and the resulting captures are inherently aligned.

## Where this maps to sustainment

The same data-plane skeleton serves multiple sustainment-relevant sensor classes:

- **Rotating machinery diagnostics.** Pair the board with eight vibration accelerometers around a turbine bearing housing; the eight-channel correlation captures unbalance, misalignment, and bearing-defect frequencies that single-channel monitors miss.
- **Power-quality monitoring of a forward-base microgrid.** Eight channels of voltage and current with the same time base let you compute true power, harmonic distortion, and arc-fault signatures across phases simultaneously.
- **RF environment mapping.** Eight antennas, eight RF down-converters, eight ADCs — and you have the front-end of a small direction-finding array. The DSP layer runs the angle-of-arrival math.

The point is not that one board fits all of these. The point is that the architectural skeleton — synchronized acquisition, fabric-side preprocessing, DSP-side feature extraction, host-side decision — is the same across all of them. The cost of the engineering is amortized across sensor classes.
`,
  },
  {
    slug: "real-time-os-for-mission-critical",
    title: "Hard Real-Time on ARM: Adopting Xenomai for Mission-Critical Sustainment Workloads",
    category: "Real-time",
    summary:
      "When a sustainment workload needs deterministic response in the tens of microseconds — closed-loop motion control, safety interlocks, time-sensitive networking — a vanilla Linux scheduler is not enough.",
    date: "2024-06-14",
    readingTime: "5 min read",
    body: `
## The constraint

A class of sustainment workloads sits in an awkward middle ground: they're complex enough that you want a real operating system underneath them — file systems, networking, package management, security tooling — but they have a deterministic-response requirement that mainline Linux cannot meet.

Examples include:

- A robotic depot system performing repetitive precision pick-and-place where the closed-loop control band is around 1 kHz.
- A safety interlock for a remote refueling rig where the worst-case response from sensor-event to actuator-cutoff must stay under 100 µs.
- A time-sensitive networking endpoint that has to satisfy IEEE 802.1Qbv scheduled-traffic guarantees with sub-millisecond gate precision.

The mainline Linux scheduler, even with the PREEMPT_RT patch applied, will typically guarantee worst-case latency in the low hundreds of microseconds. That's adequate for many workloads, but the three above are not among them.

## Two viable adoption paths

There are two approaches that get a system into the tens-of-microseconds latency regime while retaining a full Linux userspace:

**Path A: PREEMPT_RT mainline patches.** This is the simpler choice. Apply the mainline real-time patch series to the kernel, configure with full-preemption mode, and pin the real-time threads with appropriate scheduling policy and priority. Tooling is mature and the upstream story is improving with each release; PREEMPT_RT is on the path to becoming part of mainline.

For most cases, this is correct and sufficient. Worst-case latency on a quiesced ARM Cortex-A system typically lands in the 80–150 µs range.

**Path B: Xenomai co-kernel.** When the requirement is harder — single-digit microsecond response, or determinism under cache-thrashing background load — a co-kernel architecture is the right tool. Xenomai installs alongside Linux: a small real-time nucleus has priority over the Linux kernel, and real-time threads run inside the nucleus with their own scheduler. Linux is treated as the lowest-priority thread of the real-time nucleus.

This is more invasive — you can't just install Xenomai from a package manager on most ARM platforms, you need a board-support package that's been adapted — but the latency floor is dramatically lower. Worst-case response of 6–10 µs on a modest Cortex-A is realistic.

## The porting effort

A Xenomai port to a new ARM SoC family is a substantial but bounded task. The components that need attention:

- **Interrupt pipeline.** Xenomai uses Adeos (I-pipe) to interpose between the SoC's interrupt controller and Linux. This requires SoC-specific patches in the architecture-dependent layer.
- **Timer subsystem.** The real-time nucleus needs a high-resolution timer that the Linux side cannot stall. Most modern ARM SoCs have the ARM generic timer architecture that works well; older SoCs may need a board-specific timer to be carved out.
- **SMP affinity.** Real-time threads should be pinned to a CPU not shared with Linux housekeeping work. On a quad-core SoC, dedicating one core to the real-time nucleus and three to Linux is a common pattern.
- **Driver coverage.** Drivers used in the real-time path (GPIO, SPI to motor controller, Ethernet to TSN switch) must be real-time-aware. Vanilla Linux drivers will work, but their latency under Xenomai is no better than under PREEMPT_RT — the real wins come from purpose-written real-time-domain drivers.

For an Cortex-A15-class platform with a typical sustainment workload set, the porting effort is roughly six to twelve weeks of engineering for a competent team, plus a robust regression suite that measures latency under stress.

## Validation discipline

A common failure mode is to declare victory after a clean benchmark run. The realistic stress test sequence is:

1. Run the application's real-time threads.
2. Saturate the non-real-time cores with compute load (kernel compile, video transcode).
3. Saturate the file system with bursty I/O.
4. Saturate the network with full-rate non-real-time traffic.
5. Run all of the above for at least 24 hours.
6. Plot the latency CDF, including the upper tail.

Worst-case is what matters; mean and even 99.9th percentile can mask the failure mode that ends up biting in deployment. A Xenomai port that holds 10 µs at the 99.99th percentile but spikes to 800 µs once every six hours is not actually deterministic, and the spike will eventually correspond to the wrong moment in a mission.

## When this is overkill

For everything that does not have a firm sub-millisecond requirement, PREEMPT_RT is the better answer. The engineering and maintenance overhead of a co-kernel architecture is real, and most sustainment workloads — even ones with "real-time" in their requirements documents — do not actually need the co-kernel. The discipline is to measure first, choose second.
`,
  },
  {
    slug: "edge-inference-for-perimeter-sustainment",
    title: "On-Device Inference at the Forward Edge: Algorithms, Power, and Practical Limits",
    category: "Edge AI",
    summary:
      "What a 6–12 TOPS edge inference accelerator actually does well versus poorly, and how to think about deploying it as part of a forward sustainment posture rather than as a stand-alone camera.",
    date: "2024-07-02",
    readingTime: "7 min read",
    body: `
## Where this conversation usually goes wrong

A common pattern in defense AI discussions is to size an inference accelerator by the TOPS number on the datasheet and assume that "more TOPS = more capability." That framing collapses a real engineering trade-off into a single scalar and produces architectural decisions that look reasonable on a slide deck but break in the field.

A useful counter-frame: a 6 TOPS INT8 accelerator running at sustained load draws roughly 5–8 W. A 60 TOPS accelerator running at the same fraction of peak draws 30–60 W. The difference is the entire SWaP budget of a man-pack. If the workload doesn't actually need the larger device, you've spent the budget on capability you can't use.

## What the smaller class is good at

A 6–12 TOPS edge accelerator, integrated with an ARM application processor, video decode hardware, and 4–8 GB of LPDDR memory, runs the following workloads well in real time:

- **Eight to sixteen simultaneous 1080p video streams** at 15 fps each, with one to two AI tasks per stream. Typical task mix: a YOLOv5-class object detector plus a lightweight classifier or tracker.
- **Standard perimeter analytics** — intrusion detection, loitering detection, perimeter line crossing, license-plate recognition, basic action recognition (sitting, standing, walking, running). Each task at the 15–30 fps tier per channel.
- **Pre-trained models from the standard model zoo** — MobileNet, EfficientNet, YOLOv5/v6/v7, ResNet50, ASR models in the wav2vec-base family. Anything in this regime runs at real-time latency.
- **A modest amount of on-device retraining or adaptation** — fine-tuning the last few layers of a pre-trained backbone on a couple of hundred local examples. Full from-scratch training does not happen on these devices; that's a depot or cloud workload.

## What it doesn't do well

Three workload classes look feasible on paper but fail in practice:

- **Real-time inference on large language models or large multimodal models.** Even a 7B-parameter LLM in 4-bit quantization is on the edge of memory-feasibility for an 8 GB device, and the per-token latency is measured in hundreds of milliseconds. For workloads that genuinely need a generalist model, the accelerator is the wrong device class. Either run the LLM at the depot and accept the round-trip, or use a much larger compute class.
- **Per-pixel dense prediction at native resolution and high frame rate.** Semantic segmentation at 1080p30 — for every pixel, classify what kind of terrain or object — is borderline. It works for one or two channels; it does not scale to the eight-channel video board mentioned earlier.
- **Anything that requires sustained 100% utilization in a thermally-constrained enclosure.** The accelerator's quoted TOPS number assumes silicon at 50 °C. A fanless industrial enclosure at 60 °C ambient with the accelerator at 95 % utilization will thermally throttle within ten to twenty minutes. Sustained workloads should be sized at 50–60 % of peak, not at peak.

## A deployment pattern that works

For forward-base perimeter, distributed depot security, or unmanned ground vehicle situational awareness, a workable architectural pattern is:

1. **Distribute the inference, centralize the curation.** Each edge node runs its own perimeter analytics, locally. False-positive review and model retraining happen at the depot, batched. The link between edge and depot is intermittent and asymmetric — high-rate upload of confidence events, low-rate download of updated model weights.
2. **Quantize aggressively for the production model, full-precision for the validation model.** Production runs in INT8 because that's what the accelerator likes. Validation, retraining, and adversarial-example generation run in FP16 or FP32 at the depot. The two models stay version-locked.
3. **Treat the model registry as part of the sustainment supply chain.** Each model version is a logistics item: it has a version, a validation report, a list of platforms it's been tested on, and a deployment path that's the same as any other software supply. Models that bypass this registry — pulled from an engineer's laptop, trained ad hoc — should not run in production.

## Power budgeting

A useful first-order budget for a man-pack edge inference unit:

| Component | Power (W) |
|---|---|
| Inference accelerator (6–12 TOPS) | 5–8 |
| Application processor (ARM A53 / A55 / A72) | 2–4 |
| Video decode (8-channel H.264) | 2–3 |
| Memory + I/O | 1–2 |
| Storage (eMMC + microSD) | 0.5 |
| Networking (1 Gb Ethernet + Wi-Fi/BT) | 1.5 |
| **Total** | **12–19** |

That is the budget you actually need to plan around. A 100 Wh battery — typical for a man-pack — gives you 5–8 hours at this draw. If the application demands longer, the answer is either a bigger battery (SWaP penalty) or a duty-cycled compute mode (algorithmic work).

## Sustainment relevance

The applicability to sustainment is twofold:

- **Asset condition awareness in degraded comms.** An edge inference node monitors a piece of equipment locally, only escalating to the depot when its on-device classifier flags an anomaly. This means the comms link is not a single point of failure — the sustainment posture degrades gracefully rather than going blind.
- **Distributed cueing.** A perimeter camera that recognizes an unauthorized vehicle can cue a sustainment-control node directly, without waiting for human-in-the-loop confirmation, when the consequence of a false positive is low (e.g., redirecting a robotic sentry, not authorizing weapons release).

Both patterns require the same architectural property: the inference happens at the device, and the network is used for control flow and supervisory loops, not for the data plane.
`,
  },
  {
    slug: "ground-surveillance-radar-architecture",
    title: "Short-Range Ground Surveillance Radar: A Reference Architecture",
    category: "Radar",
    summary:
      "FMCW + DSP+FPGA back-end for a short-range ground surveillance radar — the design pattern behind base perimeter, forward operating position, and unmanned-watch use cases.",
    date: "2024-08-04",
    readingTime: "7 min read",
    body: `
## The problem this radar class solves

A short-range ground surveillance radar (GSR) sits between thermal cameras and full air-defense systems in the perimeter security stack. Cameras give you identification but are degraded by weather, smoke, and cover. Air-defense radars give you range but their economic and SWaP profiles are wrong for fixed-site perimeter use. A GSR with one to ten kilometer range, sub-meter range resolution, and the ability to discriminate humans from animals from vehicles, fills the middle.

For DoD-relevant perimeter use cases — forward operating bases, expeditionary airfields, distributed depot security, unmanned watch towers — the practical envelope is:

- Range: 200 m (human, walking) to 8 km (vehicle, moving)
- Range resolution: 0.5–1 m
- Update rate: 1–4 Hz volume scan, faster for tracked targets
- Power: under 100 W mean for a fixed-site unit
- Form factor: a man-portable tripod for an expeditionary unit

## FMCW vs pulsed

Two waveform families dominate this class. **Pulsed** radars send short bursts and measure time-of-flight; **FMCW** (frequency-modulated continuous-wave) sweeps a chirp and measures the beat frequency between transmit and receive. For short-range GSR, FMCW wins on several axes that matter for the field:

- **Lower peak power.** FMCW spreads transmit power continuously, so the peak-to-average ratio is roughly 1:1 versus 100:1 or more for pulsed. This dramatically eases the PA, the heat-sink design, and the antenna isolation budget.
- **Better range resolution per dollar.** FMCW range resolution is bandwidth-limited, not pulse-width-limited. A 200 MHz chirp gives ~0.75 m resolution with cheap, narrow-band analog parts.
- **Cleaner Doppler.** Continuous transmission means the Doppler resolution is set by total observation time, which can be hundreds of milliseconds without giving up range. Walking humans show up cleanly against ground clutter.

The trade-off is transmit-receive isolation. FMCW radars transmit and receive simultaneously, so the antenna isolation between TX and RX paths must be 60+ dB. This is usually solved with separate antennas and careful PCB layout.

## Signal chain

The reference back-end uses a multi-core DSP for the heavy math and an FPGA for the time-critical I/Q acquisition and matched filtering:

\`\`\`
RF front-end ──→ ADC ──→ FPGA dechirp + windowing ──→ Range FFT
                                                          │
   Doppler FFT ←── Slow-time buffer ←─────────────────────┘
        │
        ├── CFAR detection
        ├── Tracker (Kalman, IMM)
        └── Classifier (target type)
\`\`\`

- **Dechirp in fabric.** Multiplying RX by a delayed conjugate of TX produces baseband samples whose frequency encodes range. Fabric does this well at line rate.
- **Range FFT per chirp.** A 1024-point FFT sized for the desired range gate.
- **Doppler FFT across chirps.** A 128- to 256-point FFT across the slow-time dimension produces the range-Doppler map.
- **CFAR + tracker on the DSP.** Constant-false-alarm-rate detection thresholds the range-Doppler map; detections feed a multi-target tracker — typically an Interacting Multiple Model (IMM) Kalman filter to handle regime transitions from "stationary" to "walking" to "vehicle."
- **Classifier on the DSP.** A small neural classifier — or a hand-tuned feature classifier when explainability matters — labels each track.

A multi-core C66x DSP comfortably runs CFAR + tracker + classifier at update rates well above what the radar produces.

## What changes for counter-UAS

The same architecture serves counter-UAS with a few changes:

- Higher elevation coverage (the antenna has to look up, not just at the horizon).
- Higher pulse-repetition or chirp rate to handle the higher Doppler velocities of small drones.
- A different classifier — drones look very different from walking humans in micro-Doppler signatures.

The back-end signal chain is reusable; only the antenna, the chirp parameters, and the classifier change.

## Where this fits in a sustainment posture

A ground surveillance radar is one of the most reliable sources of "what just moved" telemetry in a contested environment. Cameras fail in weather and at night without IR. Acoustic sensors fail in wind. GSRs are unaffected by both. Integrating GSR tracks into the sustainment decision graph — "an unauthorized vehicle approached the fuel depot at 23:14 from heading 270, speed 45 km/h, 3.2 km" — lets the platform reason about supply integrity events without depending on whether a human happened to be looking at a camera at the right moment.
`,
  },
  {
    slug: "uav-perception-radar-vision-fusion",
    title: "UAS Obstacle Avoidance: Fusing mmWave Radar with Monocular Vision",
    category: "Autonomy",
    summary:
      "A heterogeneous compute architecture for small UAS autonomy — millimeter-wave radar provides ranging in degraded visibility, monocular vision provides semantic understanding, and the two are fused on-device.",
    date: "2024-08-19",
    readingTime: "7 min read",
    body: `
## Why fuse radar and vision

A small unmanned aircraft system operating autonomously in degraded visibility — dust, smoke, fog, low-light, GPS-denied indoor environments — cannot rely on optical sensing alone. Cameras have well-known failure modes: featureless surfaces defeat optical flow, low contrast defeats stereo, motion blur from rapid maneuvering defeats both.

Adding millimeter-wave radar gives the platform a sensor with complementary failure modes. Radar sees through dust, smoke, and most fog. It provides direct range and range-rate measurements without the computational cost of stereo or structure-from-motion. It is unaffected by lighting.

What radar does not give you is semantics. A radar return tells you "there is an object at 12 m, closing at 3 m/s." It does not tell you whether the object is a tree branch (minor course correction), a power line (mission-ending), or another aircraft (regulatory event). Vision, when it works, provides that interpretation.

## Architecture

The reference compute stack is a three-tier heterogeneous SoC:

- **DSP** for the radar signal-processing chain: dechirp, range/Doppler FFTs, CFAR detection, target list generation.
- **FPGA** for the camera pipeline: image undistortion, optical flow, region-of-interest extraction.
- **ARM** for the fusion layer, mission planner, and flight-control I/O.

Each task has a different computational character. The radar chain is regular, predictable, latency-critical — a DSP workload. The camera pipeline is per-pixel, parallel, can absorb arbitrary parallelism — an FPGA workload. The fusion layer is irregular, branchy, easier to develop in C++ — an ARM workload.

\`\`\`
mmWave radar ──→ DSP ──┐
                       │
                       ├──→ ARM fusion ──→ Flight controller
                       │
Camera ──→ FPGA ───────┘
\`\`\`

## The fusion problem

Radar gives you a target list — typically a few tens of detections per frame, each annotated with range, range-rate, azimuth, elevation. Vision gives you detected objects in the image plane, each with bounding box and class confidence.

Two common patterns for cross-sensor association:

**Geometric association.** Project each radar detection into the image plane using the known sensor-to-sensor calibration. For each radar detection, find the camera detection whose bounding box best contains the projected point. Simple, but sensitive to calibration error — a 1° rotation error produces a 17 cm projection error at 10 m range, which can move the projected point outside its bounding box.

**Probabilistic gating.** Each detection becomes a Gaussian in a joint state space (position, velocity, class). The Mahalanobis distance between radar and camera detections is computed in that joint space, with cross-sensor weighting tuned to reflect each sensor's uncertainty. Handles calibration error gracefully but requires honest characterization of sensor noise.

For a fielded autonomy system, gating is the right answer. The calibration error is real and not constant — the rigid mount flexes thermally and mechanically — and a fusion algorithm that breaks at 1° rotation error is too brittle for an aerial platform.

## Failure-mode design

The interesting design questions are how the autonomy degrades when one sensor fails:

- **Camera blinded** (smoke, dust, sun in lens). Radar still produces a target list. Fall back to radar-only obstacle avoidance with a conservative buffer (classification is lost). Essentially "stop or slow down for anything that's there, regardless of what it is."
- **Radar saturated** (heavy clutter, multipath in a structured environment). Vision still works. Fall back to vision-only with reduced top speed, since vision-only obstacle detection has higher latency and lower range accuracy than radar.
- **Both degraded** (heavy rain at low altitude, dense smoke). The platform should refuse to make autonomous maneuvering decisions and either hold position (if it can determine it has clear airspace immediately around it) or initiate a controlled descent. The "do not pretend you can see when you can't" rule.

These failure modes need to be designed in from the start. A fusion algorithm that assumes both sensors are always available will produce nonsense outputs (with high confidence) when one fails.

## Sustainment relevance

The DoD interest in small autonomous platforms — ISR, comms relay, contested last-mile delivery — is well documented. From a sustainment perspective, the same architectural pattern serves two roles:

1. **Tactical resupply autonomy.** A small fixed-wing or rotary platform carrying a 5–20 kg payload needs reliable obstacle avoidance to traverse contested terrain. The compute stack above is the substrate.
2. **Inspection of supply infrastructure.** A small platform performing autonomous patrols of fuel lines, perimeter fences, or vehicle parks needs the same sensing capability for safe navigation around poorly-mapped structures.

Both use cases benefit from on-device fusion. Both fail if the system depends on a real-time link to a ground station for perception.
`,
  },
  {
    slug: "tsn-deterministic-ethernet-mission-systems",
    title: "Time-Sensitive Networking for Mission Systems: IEEE 802.1Qbv in Practice",
    category: "Networking",
    summary:
      "What TSN actually buys you over conventional Ethernet for mission-critical systems — and the implementation patterns that determine whether your end-to-end latency is bounded or just average.",
    date: "2024-09-03",
    readingTime: "6 min read",
    body: `
## The problem with Ethernet for mission systems

Conventional Ethernet has been the workhorse of office and industrial networks because it is cheap, well-understood, and good enough where the latency requirement is "responsive feel." It is famously not good enough where the requirement is "deterministic upper bound on latency, even under heavy load from competing flows."

Mission systems care about the second requirement. A flight-control servo command, a weapons-release authorization, a safety interlock — these have firm latency requirements in the tens or hundreds of microseconds, with no allowable variance from a contending video stream or a software update happening on the same wire.

The traditional answer was a separate physical network for the deterministic traffic — ARINC 429, MIL-STD-1553, CAN, dedicated point-to-point links. The maintenance and integration overhead of parallel networks is substantial, which has driven the IEEE 802.1 Time-Sensitive Networking (TSN) family of standards.

## What TSN adds

TSN is a family of standards. Two matter for most mission-system use cases:

- **IEEE 802.1AS** — Generalized Precision Time Protocol (gPTP). All TSN nodes share a synchronized clock, typically to sub-microsecond accuracy. Without shared time, no scheduled-traffic guarantee is meaningful.
- **IEEE 802.1Qbv** — Scheduled traffic. Each switch port runs a set of priority queues, each gated by a programmable schedule. At any moment, exactly one queue is allowed to transmit; all others are blocked. The schedule is configured per-port and repeats with a configurable cycle time.

Together, these let the network designer reserve specific microsecond windows for specific traffic classes. A high-priority flight-control message has its own queue and its own window; even if a 1 Gbps video stream is fully utilizing the link, the flight-control message is guaranteed to transmit during its window.

## End-to-end latency in a TSN system

The thing that makes TSN actually deterministic — versus "lower-average-latency Ethernet" — is the per-hop schedule discipline. To bound end-to-end latency, every switch along the path must schedule its outbound port to allow the traffic class to pass at the right moment.

This is a design-time exercise. For each critical flow, the system architect:

1. Identifies the source, sink, and path (which switches, which ports).
2. Computes the per-hop transmission time including PHY serialization, switch processing, and queue gate latency.
3. Allocates a window at each hop in the schedule, with appropriate slack for clock-sync error and worst-case interference from lower-priority traffic.
4. Configures each switch's port schedule via NETCONF or equivalent.

The result is a system where the latency from sensor to actuator is bounded — typically within 100–250 µs for a three-hop topology — regardless of what other traffic is on the network.

## Implementation realities

Three lessons from teams that have shipped TSN systems:

**Schedule changes are expensive.** Reconfiguring a TSN schedule touches every switch on the path. Adding a new critical flow late in development means recomputing and redeploying schedules across the topology. The discipline is to define the schedule structure early and reserve slack windows for late-added flows.

**Non-TSN endpoints break the model.** A misbehaving endpoint that sends bursts at line rate without queue cooperation will not break TSN's bounded-latency guarantees per se — the switches enforce the schedule regardless — but it can starve lower-priority traffic to the point that the system as a whole becomes unusable. Network admission control matters.

**Clock-sync is the single most important property.** A 100 µs schedule with 10 µs clock-sync error is a 110 µs schedule with extra steps. Invest in good clock distribution hardware and good gPTP daemon configuration; it pays back across every flow.

## Where TSN fits in a sustainment posture

A sustainment platform coordinating decisions across compute nodes — depot servers, in-vehicle controllers, sensor processors, operator stations — benefits from TSN in two specific places:

- **Real-time telemetry from instrumented assets.** Vibration sensors, fuel-level transducers, battery monitors — when these feed a closed-loop control or alarm function, their messages need bounded latency. A TSN flow class for "asset telemetry" gives deterministic delivery without overprovisioning the network.
- **Cross-system safety interlocks.** When a robotic depot interacts with a human worker (a wheeled cargo handler in a maintenance bay), the safety stop signal between worker-detection sensor and motor controller is a TSN flow. The latency budget is firm (tens of milliseconds for human-collision-avoidance) and conventional Ethernet does not meet it.

Convergence on TSN means the operator doesn't have to maintain a separate physical network for the deterministic traffic, which is a sustainment win in itself.
`,
  },
  {
    slug: "direction-finding-multi-channel-rf",
    title: "Multi-Channel RF Direction Finding: Architectural Choices for SIGINT and EW",
    category: "EW",
    summary:
      "Coherent multi-channel receivers, angle-of-arrival algorithms, and the integration patterns that determine whether a DF system gives you 1° accuracy or 10°.",
    date: "2024-09-17",
    readingTime: "8 min read",
    body: `
## The problem space

Radio-frequency direction finding (RFDF) — determining the angle of arrival of an RF emission — is a workhorse capability for signals intelligence and electronic warfare. Tactically, it answers questions like "where is the jammer," "where is the unauthorized transmitter," and "is that signal coming from the same direction as last time." Operationally, it feeds the wider sensor-fusion picture: a heading from one DF receiver crossed with a heading from another produces a fix.

The engineering challenge is that achievable accuracy is set by a stack of decisions that each contribute error: antenna array geometry, channel-to-channel calibration, ADC sample-clock alignment, algorithm choice, and the SNR of the signal being measured.

## Hardware architecture

A modern DF receiver is built around a coherent multi-channel ADC subsystem. "Coherent" means every channel samples at exactly the same instant — to within picoseconds, not nanoseconds. Without coherent sampling, downstream algorithms are wasted.

The reference architecture:

- **N antenna elements**, where N is typically 4, 6, or 8 for a 2D direction-finding array. More elements buy better angular resolution at the cost of physical size and channel count.
- **N RF front-ends**, all locked to a common local oscillator. The LO distribution must be phase-matched across paths — usually with semi-rigid coax or a dedicated PCB power divider.
- **N ADCs**, all driven by the same sample clock from a low-jitter PLL. The single most important hardware property of the system.
- **An FPGA** that captures the N parallel streams, applies per-channel calibration, and forwards calibrated samples to the algorithm engine.
- **A DSP** that runs the angle-of-arrival algorithm.

Calibration is the part teams most often underestimate. The receiver chains are nominally identical but in practice exhibit channel-to-channel differences in amplitude (±0.5 dB) and phase (±5°) that drift with temperature. Without calibration, angular accuracy is dominated by these differences. The discipline is to inject a known reference signal across all channels periodically (every few seconds) and update calibration coefficients in fabric.

## Algorithm choices

Three algorithm families dominate practical DF systems:

**Conventional beamforming.** Compute the array response in each candidate direction and take the maximum. Simple, robust, well-understood. Angular resolution is set by the Rayleigh limit. Adequate for tactical use cases where 5–10° accuracy is good enough.

**Capon / MVDR (Minimum Variance Distortionless Response).** A maximum-likelihood estimator under Gaussian noise assumptions. Higher angular resolution than conventional beamforming, but sensitive to calibration error and signal-correlation conditions. Typical accuracy: 1–3° under good calibration.

**MUSIC and ESPRIT.** Subspace methods that exploit the eigenstructure of the array covariance matrix. Highest angular resolution — sub-degree under ideal conditions — but require knowing the number of signals present and break badly under coherent multipath. Implementation cost is dominated by the eigendecomposition of an N×N matrix, which a multi-core DSP handles comfortably for N ≤ 16.

For a fielded SIGINT/EW system the right design is usually a hybrid: conventional beamforming as the always-on baseline, with MUSIC available for high-value targets where the operator is willing to pay the computational and operational complexity for higher accuracy.

## What hurts accuracy in practice

Three failure modes account for most field-versus-lab accuracy disappointment:

- **Multipath.** Signals reflecting off buildings, terrain, and the vehicle's own structure arrive from multiple directions simultaneously. Conventional beamforming spreads the apparent angular distribution; MUSIC and ESPRIT assume signals are uncorrelated, which multipath violates. Mitigation: spatial smoothing (subaperture averaging), which costs aperture but recovers algorithm robustness.
- **Mutual coupling between antenna elements.** The radiation pattern of each element is perturbed by the presence of neighbors. Calibration with a single-source reference does not capture this. Mitigation: either a full electromagnetic calibration (slow, lab-grade) or a calibration that uses two sources at known angles to fit a parametric coupling model.
- **Quantization-induced bias.** At low SNR, ADC quantization noise looks like an additional signal source to the algorithm, biasing the angular estimate. Mitigation: dither (deliberately injected analog noise) and longer integration time.

## Sustainment relevance

A sustainment platform operating in a contested environment can benefit from DF telemetry as one input to its situational picture. Knowing that an unauthorized transmitter is active 7 km north at bearing 015° changes the recommended supply-routing decision in a way that the platform should reason about explicitly.

The integration is not "we run a direction-finding system." It is "we consume DF tracks from a separate sensor system, fuse them with the rest of the picture, and reason about implications for sustainment operations." That requires a clean interface from the DF system (a stream of bearing-line records with confidence intervals) and a model of how DF accuracy degrades with range, signal type, and environment.
`,
  },
  {
    slug: "hardware-rooted-secure-boot",
    title: "Hardware-Rooted Secure Boot for Field-Deployed Compute",
    category: "Security",
    summary:
      "A defense-grade trust chain — from immutable boot ROM through measured boot to attested runtime — that survives a stolen device and an opportunistic supply-chain tamper.",
    date: "2024-10-01",
    readingTime: "6 min read",
    body: `
## Why this matters more in the field

A compute device that lives in an office can rely on physical security. The threat model is "someone might run unsigned software on it," and a signed-firmware enforcement is enough.

A compute device that lives in a forward-deployed vehicle, a perimeter sensor, or an unattended unmanned platform has a different threat model:

- **Physical capture.** An adversary takes the device, opens it, and tries to extract its firmware, its keys, and its data.
- **Supply-chain tamper.** An adversary intercepts the device before it reaches the user and modifies firmware or hardware to enable later exfiltration or sabotage.
- **Persistent rootkit.** An adversary gains code execution remotely, then installs a rootkit that survives reboots and OS reinstalls.

Each maps to a different layer of the trust chain. None are solved by signed firmware alone.

## The trust chain

A defense-grade trust chain is a sequence of layers, each authenticating the next, starting from an immutable root:

1. **Boot ROM** — burned into silicon at fabrication. Cannot be modified. Contains the verification key for the first stage of firmware.
2. **First-stage bootloader** — signed by the silicon vendor's or platform owner's private key, verified by the boot ROM. Loads and verifies the next stage.
3. **Second-stage bootloader** — verified by first-stage. Typically loads U-Boot or equivalent.
4. **Kernel and initramfs** — verified by second-stage.
5. **Root filesystem** — measured (hashed) and either verified against a known-good hash list (dm-verity) or attested to a remote verifier.
6. **Application runtime** — signed and version-pinned applications, with signature verification at load time.

Each layer hashes the next before passing control. The hashes accumulate in a Platform Configuration Register (PCR) in the device's TPM or equivalent secure element. The final PCR value is a cryptographic summary of the entire boot — any modification anywhere in the chain produces a different PCR value.

## Where physical-capture resistance comes from

The boot chain prevents an attacker from running modified firmware on a stolen device, because the silicon's boot ROM will reject any first-stage signed by the wrong key. The attacker cannot replace the boot ROM (it's immutable) and cannot extract the signing key (it's in an HSM, not on the device).

Data-at-rest is harder. A stolen device's storage contains sensitive operational data; the boot chain does not protect that. The standard answer is full-disk encryption with the key sealed against the PCR values: the disk can only be decrypted on a device whose boot has produced the expected sequence of measurements. A stolen device's storage is unrecoverable because:

- The decryption key is not stored in the clear anywhere.
- The boot environment on a different device produces different PCRs, which means the sealed key cannot be unsealed.
- The boot environment on the same device, but with modified firmware, also produces different PCRs.

## Where supply-chain-tamper resistance comes from

The trust chain above does not protect against tamper at the boot ROM level — that's the trust root, and if it's compromised the entire chain is compromised. Defenses against that are physical:

- **Anti-tamper coatings** on the package that destroy the silicon if probed.
- **Authenticated parts sourcing** through DLA-approved channels for sensitive components.
- **Receiving inspection** with X-ray and electrical signature comparison against a golden reference.

For lesser components (bootloader, kernel, etc.), the trust chain itself provides supply-chain tamper resistance: an adversary who modifies the bootloader between manufacturing and deployment cannot match its signature against the boot ROM's public key.

## Implementation realities

Two recurring lessons from teams that have deployed this chain in the field:

**Key management is harder than the cryptography.** The signing keys for the firmware images are themselves the highest-value targets. Where do they live? Who has access? How are they rotated? How are revocations distributed to fielded devices? These are organizational questions, not technical ones, and they account for the majority of operational secure-boot failures in production.

**Recovery is a first-class concern.** A device whose firmware is corrupted (legitimate corruption — flash failure, power-loss during update) must be recoverable. The standard architecture is to maintain two firmware slots and atomically switch between them on successful boot. Without this, a firmware update that bricks one device in a thousand becomes an unacceptable failure rate at fleet scale.

## Sustainment relevance

A sustainment platform that runs on fielded compute is, itself, a target. Its sensor inputs, its operational decisions, its data lake — all are valuable to an adversary. The trust chain above is the foundation that lets the platform make integrity guarantees about its own operation, and lets the higher echelon make trust decisions about what a particular fielded node is telling them.
`,
  },
  {
    slug: "can-bus-military-vehicle-integration",
    title: "Integrating Compute Into Military Vehicles: CAN, J1939, and the Real-World Wiring Closet",
    category: "Vehicle Systems",
    summary:
      "Adding a compute node to an existing military or commercial-derived military vehicle — bus protocols, electrical isolation, and the integration patterns that survive shock, vibration, and 24V transients.",
    date: "2024-10-16",
    readingTime: "6 min read",
    body: `
## The integration problem

A modern military or commercial-derived military ground vehicle is a distributed computing system before any additional compute is added to it. Engine control, transmission, brakes, lighting, sensors, body controllers — all communicate over a Controller Area Network (CAN), typically following the SAE J1939 application-layer standard.

The integration task — adding a compute node that needs to observe vehicle state and occasionally send commands back — looks straightforward on paper: plug into the CAN bus, parse the J1939 messages, write the ones you want to send. In practice, three problems make this much harder than it looks.

## Problem one: bus contention

The vehicle's existing CAN bus is engineered for a specific message rate and load. Adding a new node that reads is free; adding a new node that writes can disrupt the bus's timing assumptions and cause existing ECUs to mis-time their messages.

The discipline is:

- **Read-only attachment** for any compute node that is not the system of authority over the vehicle. The node listens to broadcasts and never asserts on the bus.
- **Gateway pattern** for compute nodes that need to write. A dedicated CAN-to-CAN gateway with hard rate-limiting and message filtering sits between the new compute node and the vehicle bus. The gateway is a hardware component with its own MCU, designed to fail safe (silent on the vehicle side) under any failure mode of the compute node.
- **No CAN injection on critical buses.** Some vehicle buses (typically the chassis-control CAN carrying brake and steering commands) should not be written to by anything other than the OEM ECUs. Compute nodes that need to influence those systems do so via the vehicle's accessory interface, not directly.

## Problem two: electrical isolation

A military vehicle electrical environment is hostile. The nominal 24 V bus routinely sees:

- **Transients to ±200 V** during engine cranking or alternator load dumps.
- **Conducted EMI** from radar, comms, and electric weapon-system loads on the same vehicle.
- **Ground loops** when a compute node is grounded to the chassis at a different point than the bus it's connected to.

A compute node directly connected to the vehicle CAN bus will exhibit one or more of: random reboots, CAN error frames at high rates, slow death of CAN transceivers, or in the worst case, damage propagating back through the bus to vehicle ECUs.

The defense is galvanic isolation:

- **Isolated CAN transceivers** between the compute node and the bus.
- **Isolated power input** — a DC-DC converter with isolation between the vehicle 24 V rail and the compute node's internal rails.
- **Single-point grounding** to the chassis, with the bus signal grounds floated.

This is well-trodden ground in industrial control, and the parts exist as commodity components. The mistake is to leave isolation out as a cost optimization; the failure rate at scale is high enough that the saved BOM cost is wiped out by service calls.

## Problem three: shock and vibration

Military vehicles, especially tracked vehicles and trucks running off-road, present mechanical environments that exceed MIL-STD-810 levels routinely. A compute node using commodity connectors, commodity board mounts, and commodity solder joints will exhibit progressive failures over months of service.

The discipline is:

- **MIL-spec connectors** for any external interface. D38999 series for circular, MIL-DTL-83513 for rectangular. The pin-engagement force and locking mechanism are the difference between "intermittent connection that drives months of debug" and "works for ten years."
- **Conformal coating** on the PCB to immobilize components against vibration.
- **Mechanical mounts** rated for the vibration profile.
- **Solder joint inspection** at receiving. X-ray of BGA joints catches manufacturing variability that becomes field failures later.

## What's worth the OEM partnership

Some integrations are worth doing as a partnership with the vehicle OEM rather than as an aftermarket bolt-on:

- The integration needs to write commands to chassis-control systems (braking, steering, transmission).
- The integration needs vehicle-wide power budget changes that exceed accessory-circuit ratings.
- The integration needs to live inside the cab in a position that requires NHTSA / FMVSS / MIL-STD-810 environmental qualification at the vehicle level, not just the component level.

For all of these, the right structural answer is an OEM partnership and a co-engineered installation. The compute platform's interface to such a vehicle is then a defined interface to the OEM's existing accessory CAN, not a custom wiring harness.

## Sustainment relevance

The end-state for a sustainment platform running inside a vehicle is that the platform observes vehicle state (engine hours, fuel rate, fault codes), makes sustainment decisions (predictive maintenance, mission-readiness scoring, supply-chain pre-positioning), and surfaces those decisions to crew and rear-echelon planners. None of that works if the compute node itself is the unreliable component of the vehicle.
`,
  },
  {
    slug: "compute-fabric-pcie-vs-srio",
    title: "Multi-Board Compute Fabrics: PCIe vs Serial RapidIO for Mission Subsystems",
    category: "Networking",
    summary:
      "When a mission subsystem spans multiple processor boards, the backplane fabric you choose determines latency, scalability, and how much pain a board swap inflicts.",
    date: "2024-10-29",
    readingTime: "5 min read",
    body: `
## Why multi-board systems exist

A nontrivial signal-processing or fusion subsystem often needs more compute than a single processor board provides. The work fans out across multiple boards — perhaps a Kintex-class FPGA for the front end, a multi-core DSP for the algorithmic middle, and a general-purpose CPU board for control and storage. Those boards have to talk to each other at high bandwidth and low latency.

For the past 15 years, two backplane fabrics have dominated this niche: PCI Express (PCIe) and Serial RapidIO (SRIO). They look superficially similar — both are point-to-point serial fabrics, both run at multi-gigabit lane rates, both support switched topologies — but they have different operational characters that matter at design time.

## PCIe: the commercial standard

PCIe is the fabric everyone already has. Every modern CPU, every modern FPGA with a transceiver, every off-the-shelf SSD or NIC supports PCIe natively. This translates to:

- **Cheap silicon and tooling.** PCIe IP cores, switches, retimers, and protocol analyzers are commodity items.
- **Mature software stacks.** Linux has been driving PCIe devices for two decades; PCIe is the default device interface on x86 and ARM.
- **Single-root tree topology.** A PCIe system has one root (typically a host CPU) and a tree of devices beneath it. Devices do not normally talk to each other; all traffic goes through the root.

The tree topology is PCIe's blessing for software simplicity and its curse for multi-board mission systems. If three FPGA boards in a system need to exchange high-bandwidth data with each other (typical of a radar back-end that distributes range bins across boards for parallel processing), every transfer goes through the host CPU's memory controller. This serializes the system at the host and wastes its DRAM bandwidth on traffic that has nothing to do with the host.

Modern PCIe extensions — peer-to-peer DMA, NTB (non-transparent bridging) — partially work around the tree limitation, but each adds complexity and is only well-supported on subsets of silicon.

## SRIO: the embedded standard

Serial RapidIO was designed from the start for peer-to-peer fabrics in embedded systems. Its operational character differs:

- **No host concept.** Every endpoint is symmetric. Any endpoint can DMA to any other endpoint without involving a host.
- **Low protocol overhead.** SRIO has smaller packet headers than PCIe and a simpler flow-control model, giving slightly higher useful bandwidth on the same link rate.
- **Better worst-case latency.** SRIO's per-hop latency is roughly half PCIe's for the same data, primarily because of the simpler header processing.
- **Limited silicon support.** SRIO is mostly found in multi-core DSP families and some FPGAs. It is not native to mainstream x86 or ARM processors.

For a system whose data movement is intrinsically peer-to-peer — a multi-DSP signal processing system, a multi-FPGA radar back-end — SRIO is architecturally a better fit. For a system that is host-centric and primarily moves data between a host and devices, PCIe is the better fit.

## Decision framework

A few questions decide which fabric is right:

**Is the data flow host-centric or peer-to-peer?** If most transfers are between a host CPU and a device (NIC, SSD, GPU), PCIe is correct. If most transfers are between devices (FPGAs talking to DSPs talking to other DSPs), SRIO is correct.

**What's the silicon constraint?** If the chosen processors and FPGAs all have PCIe natively but no SRIO, designing in SRIO requires bridges, which add cost and latency. The pragmatic answer for any system built around modern x86 or ARM is PCIe even if SRIO would be architecturally cleaner.

**What's the maintenance posture?** PCIe's commodity tooling and broad expert pool means a sustainment engineer at a forward depot is more likely to be able to diagnose a fabric issue. SRIO debug requires more specialized knowledge and tooling.

**What's the latency budget?** For applications with sub-10 µs end-to-end latency requirements across multiple hops, SRIO's lower per-hop latency starts to matter. For applications with 100+ µs budgets, the difference is in the noise.

## Sustainment relevance

A sustainment platform's compute footprint is primarily host-centric — application servers, decision engines, databases. PCIe is the right fabric for internal systems.

The relevance of this discussion is that the **edge** systems we integrate with (radar back-ends, signal-processing platforms, multi-DSP sensor processors) are often SRIO-based. When the platform ingests data from those systems, the interface is usually a high-level network protocol (Ethernet, IPv4) at the edge of the SRIO domain, not direct SRIO peering. Understanding what's on the other side of that interface lets us reason about latency budgets, message rates, and graceful degradation.
`,
  },
  {
    slug: "predictive-maintenance-vibration-current-signature",
    title: "Predictive Maintenance for Rotating Machinery: Vibration and Current-Signature Analysis at the Edge",
    category: "Predictive Maintenance",
    summary:
      "The data-acquisition architecture and signal-processing patterns behind reliable bearing-defect detection, unbalance, misalignment, and electric motor fault diagnosis — done on-device.",
    date: "2024-11-12",
    readingTime: "7 min read",
    body: `
## What predictive maintenance actually is

Predictive maintenance (PdM) is the discipline of detecting the early stages of a mechanical failure in time to plan a repair before the failure produces an unplanned outage. For rotating machinery — motors, pumps, fans, gearboxes, generators — the failure modes are well understood and the underlying physics is observable through vibration and electrical signature analysis decades before catastrophic failure.

The economics are compelling. A planned bearing replacement is a one-hour job at $300 of labor. An unplanned bearing seizure that damages the shaft, the housing, and the connected pump is a multi-day repair at $30,000 of labor and parts, plus the lost throughput of whatever the pump was supporting. For sustainment-focused operations, the latter scenario can also create operational consequences (no power, no water, no fuel) that dwarf the direct repair cost.

## The fault modes

Four failure modes dominate rotating-machinery diagnostics in field-deployed systems:

- **Unbalance.** A rotor whose mass distribution is asymmetric around its axis of rotation. Produces a vibration peak at 1× the rotation frequency, in the radial direction.
- **Misalignment.** A coupling between two shafts (motor to pump, typically) that is not perfectly collinear. Produces vibration at 1× and 2× rotation frequency with characteristic axial content.
- **Bearing defects.** A rolling-element bearing developing a flaw on inner race, outer race, ball, or cage. Each defect type produces vibration at a characteristic non-integer multiple of rotation frequency, dependent on bearing geometry.
- **Electrical asymmetry in induction motors.** Broken rotor bars, stator winding shorts, or air-gap eccentricity produce sidebands in the motor current spectrum around the line frequency at specific slip-related offsets.

The first three are detected primarily through accelerometer-based vibration analysis. The fourth is detected through motor current signature analysis (MCSA) — sampling the motor's input current and looking for spectral features.

## Hardware architecture

The edge PdM unit is structurally simple:

- **Multi-channel accelerometers**, typically 4–8 channels for a machine train, with each axis (radial, axial) on its own channel.
- **Current transformers** on the motor's three phases, conditioning to feed an ADC.
- **A multi-channel synchronous ADC.** Sampling rate of 50 kSPS is sufficient for most bearing-defect frequencies; some advanced applications need 100 kSPS.
- **A processor with enough horsepower to run FFTs and envelope detection in real time.** A modern ARM Cortex-A53-class processor handles this comfortably. For high-channel-count systems (16+), a DSP or FPGA assist is warranted.
- **Storage for a baseline reference per machine.** A few hundred KB of features per machine, updated periodically as the machine ages naturally.

The architectural decision worth flagging is whether the unit is local-only (decisions made on the machine) or networked (raw data shipped to a central analytics service):

- **Local-only** for sites with intermittent or no comms — forward bases, remote depots, contested operations.
- **Networked** for sites with reliable comms — fixed installations, garrison maintenance bays.
- **Hybrid** is best in practice: local detection runs always, with alerting and routine state reporting over comms when available.

## Signal processing chain

\`\`\`
Accelerometer ──→ ADC ──→ HP filter ──→ Time-domain features
                                        (RMS, peak, crest factor)
                                ↓
                          Frequency-domain analysis
                                        ↓
                          ┌─── 1×, 2× rotation: unbalance, misalignment
                          │
                          ├─── Bearing fault frequencies (BPFO, BPFI, BSF, FTF)
                          │
                          └─── Envelope demodulation for early-stage bearing faults
\`\`\`

The four bearing fault frequencies (Ball Pass Frequency Outer race, Ball Pass Frequency Inner race, Ball Spin Frequency, Fundamental Train Frequency) depend on bearing geometry — number of rolling elements, pitch diameter, contact angle — and rotation speed. These are computed at commissioning and stored as machine-specific configuration.

Envelope demodulation is the technique that catches bearing defects months before they show up in conventional FFT analysis. A nascent bearing defect produces a low-amplitude periodic impact at the bearing fault frequency, which excites the bearing-housing resonance (typically several kHz). The high-frequency band-pass filtering and rectification ("envelope") extracts the impact periodicity from the resonant carrier.

## Why MCSA is worth the integration

Motor current signature analysis (MCSA) requires no sensors on the rotating machine — just current transformers in the motor control center, which are often already installed for protection. This makes MCSA particularly valuable for:

- Machines that are remote, sealed, or hazardous to instrument with accelerometers.
- Distributed motor populations where the cost of accelerometer installation is prohibitive.
- Pump and fan applications where the rotating element is inside a wet or pressurized housing.

The diagnostic resolution of MCSA is generally lower than vibration analysis (you find faults later, when they're worse), but the coverage is much broader.

## Sustainment relevance

A sustainment platform that ingests PdM signals across a vehicle fleet, a depot's pump population, or a forward base's power-distribution system gets:

- **Asset readiness scoring** at the population level. The platform can rank assets by predicted time-to-failure and schedule maintenance to minimize operational risk.
- **Logistics pre-positioning.** When a bearing is detected as degrading, the platform can pre-position replacement parts at the closest supply node, reducing downtime when the planned repair happens.
- **Cross-asset correlation.** A pattern of bearing failures across one class of equipment that doesn't appear in another can flag a supply-chain issue (bad batch of bearings, contaminated lubricant) that no individual asset would have surfaced.

The on-device PdM is the data source. The cross-asset analytics and the integration into the wider sustainment decision graph is the platform's role.
`,
  },
  {
    slug: "mipi-csi-camera-integration",
    title: "Camera Integration at the SoC-FPGA Boundary: MIPI CSI-2 vs Parallel for Mission Optics",
    category: "Sensor Integration",
    summary:
      "When you put a camera into a deployed compute node, the interface between sensor and processor has more design implications than the sensor choice itself.",
    date: "2024-11-25",
    readingTime: "5 min read",
    body: `
## Why the interface matters

A vision-equipped compute node has three things on the optical board: an image sensor, a lens, and an interface to the processor. The lens and sensor get most of the engineering attention because they're visible in the spec sheet ("4K @ 60 fps with f/1.8 optics"). The interface gets the rest of the design's reliability profile.

Three interface families dominate field-deployable vision systems:

- **Parallel digital video** — 8 to 16 bits of pixel data plus pixel clock, hsync, vsync. Old, simple, robust.
- **MIPI CSI-2** — the standard for modern mobile-derived sensors. Differential serial links over 1, 2, or 4 lanes.
- **Sub-LVDS / HD-SDI / coaxial video** — for sensors that need to be far from the processor (industrial machine vision, automotive camera-over-coax).

For a sensor mounted within a few centimeters of a Zynq-class SoC-FPGA — the typical configuration for a UAS payload, a vehicle sensor pod, or an inspection robot — the choice is between parallel and MIPI.

## Parallel: robust, slow, awkward

Parallel digital video is the interface every old sensor used. Its strengths:

- **Easy to verify with a scope.** Every signal is single-ended digital. Bringing up a parallel sensor with a logic analyzer is a 30-minute exercise.
- **No PHY required.** The signals go directly into FPGA pins. No serializer, no deserializer, no clock recovery, no specialized FPGA primitives.
- **Tolerant of small layout mistakes.** A parallel bus that's slightly skewed still works; the system tolerates errors on the order of a pixel clock period.

Its weaknesses:

- **Pin count.** 16 bits of pixel data + 4 timing signals = 20 pins, which dominates the FPGA pin budget for what is otherwise a modest peripheral.
- **Limited resolution-frame rate product.** Above roughly 100 megapixels per second (a 1080p30 or 720p60 sensor), parallel signal integrity becomes hard. At 4K30 (250 megapixels per second) it's effectively unworkable.
- **EMI.** A 100 MHz parallel bus radiates. In an enclosure with sensitive RF circuitry, the parallel video interface is often the dominant EMI source.

Parallel is the right answer for legacy sensors, low-resolution applications, and short-pin-budget designs where the FPGA pin count is the binding constraint.

## MIPI CSI-2: modern, dense, demanding

MIPI CSI-2 is the standard for current-generation image sensors. Its strengths:

- **Pin efficiency.** A 4-lane CSI-2 link carries 4K60 video on 10 pins (4 differential pairs + 1 differential clock).
- **EMI behavior.** Differential signaling at multi-gigabit rates radiates much less than wide parallel buses. The CSI-2 bus is usually invisible in EMI measurements.
- **Standard timing model.** All CSI-2 sensors look mostly the same to the FPGA's MIPI receiver. Switching between sensor parts is a configuration change, not a re-layout.

Its weaknesses:

- **Layout is unforgiving.** CSI-2 lanes must be length-matched within tens of mils, impedance-controlled to 100 Ω differential, and routed with no via discontinuities. A mistake at PCB layout invalidates the design.
- **PHY required.** The FPGA needs either dedicated MIPI receiver hardware or a soft MIPI receiver core that consumes a fair amount of fabric. The latter is bandwidth-limited.
- **Verification requires a CSI-2 protocol analyzer.** Bringing up a MIPI link with a generic logic analyzer is not realistic. The tooling investment is real.

CSI-2 is the right answer for any modern application that has access to dedicated MIPI hardware in the FPGA and the layout discipline to do it right.

## Practical mitigation: SerDes bridges

A common pattern in vehicle and aircraft vision systems is to put a SerDes bridge between the sensor and the processor. The sensor connects via its native interface (parallel or CSI-2) to a serializer chip; the serializer drives a coax or twinax cable to a deserializer chip on the processor board; the deserializer presents the sensor's native interface to the FPGA.

This buys:

- **Long sensor-to-processor distances.** SerDes bridges run reliably over multiple meters of cable, which is the difference between mounting the sensor in the payload bay and mounting it on the airframe.
- **EMI containment.** The coax cable shields the link from external interference and contains its emissions.

The cost is two more chips in the BOM and the additional latency of the SerDes (typically 1–2 line periods). For most applications that latency is invisible.

## Sustainment relevance

The architectural choice of camera interface affects whether a sensor stream can be added to a sustainment workflow without re-spinning a circuit board. Standard CSI-2 sensors swapped through a fixed SerDes bridge let an operator change the optical front end (different focal length, different spectrum, different sensitivity) without involving engineering. That deployment flexibility is a sustainment property in itself — the system stays useful as the mission and the threat environment change.
`,
  },
  {
    slug: "forward-microgrid-power-quality",
    title: "Forward-Base Microgrid Power Quality: Multi-Channel Monitoring as a Sustainment Foundation",
    category: "Power Systems",
    summary:
      "Real-time multi-phase power monitoring at a forward base or expeditionary site — three-phase voltage and current, harmonic distortion, arc-fault detection — and why it's a foundation for operational continuity.",
    date: "2024-12-08",
    readingTime: "6 min read",
    body: `
## Why power quality matters at a forward site

A forward-deployed installation runs on a microgrid: a couple of diesel or hybrid generators, a small battery bank, distribution to the loads that keep the site operational (communications, sensors, climate, sustainment compute, life-support systems). The quality of the electrical power on that microgrid determines whether the equipment runs reliably or fails intermittently.

The failure modes that show up in field-deployed power systems are not the same as in a building-grade utility connection:

- **Voltage sag** when a heavy motor (compressor, refrigeration unit) starts up. Loads downstream can brown out or reboot.
- **Harmonic distortion** from non-linear loads (variable-frequency drives, switching power supplies). Causes transformer heating, neutral overcurrent, and progressive equipment degradation.
- **Frequency drift** when a generator is operating outside its sweet spot. Motors run hot, clocks drift, sensitive equipment behaves erratically.
- **Arc faults** from degraded insulation in distribution wiring. Fire risk, especially in expeditionary cabling that was thrown down quickly.
- **Phase imbalance** from uneven loading across the three phases. Generator capacity is wasted, individual phases overload.

A site without instrumentation experiences these as a stream of inexplicable equipment failures. A site with instrumentation observes the conditions in real time, can correlate failures to electrical events, and can act to prevent escalation.

## Instrumentation architecture

The reference monitoring unit is built around the same multi-channel synchronous ADC architecture used for vibration monitoring, but at much lower per-channel sample rates:

- **Six analog channels minimum**: three voltages (one per phase to neutral) and three currents (one CT per phase). A seventh channel for neutral current is common.
- **Sample rate of 8–16 kSPS per channel**. Adequate for harmonics up to the 40th order, which covers everything regulatory frameworks care about.
- **High-precision ADC**: 16-bit minimum, 24-bit preferred. The high precision is for the current measurement, where a 200 A capacity must coexist with a 50 mA resolution for ground-fault detection.
- **Galvanic isolation** between the measurement channels and the processor. Power-system measurements should never share a ground with the compute node, full stop.

The processing chain is straightforward:

- **Per-cycle RMS** of voltage and current per phase.
- **Per-cycle real, reactive, and apparent power** per phase, plus three-phase totals.
- **Harmonic decomposition** via FFT, reported up to the 40th harmonic.
- **Total Harmonic Distortion (THD)** computed from the harmonic content.
- **Frequency tracking** via zero-crossing detection on a low-pass-filtered voltage signal.
- **Arc-fault detection** via a separately-tuned signature analysis on the high-frequency content of the current waveforms.

A modest application processor handles all of this in real time with headroom to spare.

## The arc-fault detection problem

Arc faults are the most consequential failure mode and the hardest to detect reliably. An arc fault produces broadband electrical noise in the current waveform, characterized by:

- Asymmetric current pulses (the arc behaves like a non-linear conductor).
- High-frequency content in the 1–100 kHz range not present in normal load currents.
- Intermittency — arcs come and go as the contact gap fluctuates.

Detection algorithms typically combine:

- Time-domain detection of asymmetric pulses against a normal-operation baseline.
- Frequency-domain detection of broadband noise outside the harmonic structure of the load.
- Temporal pattern matching against known arc signatures versus benign transient signatures (motor starts, capacitor inrush).

A well-tuned arc-fault detector for a microgrid produces single-digit false alarms per year. A poorly-tuned one produces dozens per day and is operationally useless.

## Integration with sustainment decisions

The power-quality data flow supports a few specific decision classes:

- **Generator scheduling.** When a site has multiple generators, power-quality data can drive automatic load shedding, parallel operation, or single-unit operation depending on the load profile. The right schedule extends fuel duration and reduces generator runtime.
- **Equipment pre-failure flagging.** A piece of equipment that begins drawing unexpected harmonic content is showing early signs of internal failure (motor winding insulation breakdown, capacitor degradation). The platform can flag this for inspection before the failure becomes operational.
- **Capacity planning.** Tracking peak demand over time tells the planner whether additional generator capacity is needed for current operational tempo, or whether load shifting can avoid the upgrade.
- **Maintenance correlation.** When the platform observes that equipment failures cluster after specific power-quality events, the correlation tells operations to either harden the load or address the upstream electrical issue.

## Sustainment relevance

A sustainment platform that ingests power-quality telemetry from each forward site can produce capacity, reliability, and maintenance recommendations that no individual site could produce from its own data alone. A pattern visible across a population of similar sites (specific equipment classes failing under specific harmonic conditions) is invisible at any single site. The integration of multi-site telemetry is exactly the kind of cross-asset analytics that distinguishes a sustainment platform from a site-local power monitor.
`,
  },
];

export function getInsightBySlug(slug: string): Insight | null {
  return INSIGHTS.find((i) => i.slug === slug) || null;
}
