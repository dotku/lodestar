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

export type Insight = {
  slug: string;
  title: string;
  category: "ISR" | "SDR" | "Sensor Fusion" | "Real-time" | "Edge AI";
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
];

export function getInsightBySlug(slug: string): Insight | null {
  return INSIGHTS.find((i) => i.slug === slug) || null;
}
