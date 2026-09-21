// dsh-settings-size — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/dsh-settings-size/client.js and
// executed through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The factory body is plain CJS with
// require() resolved against the shell's module table — the same shape the
// shipped ui-* packages' bundles emit.
//
// What it does: the shipped settings dialog frame (ui-settings-general's
// SettingsRoot.module.css) hardcodes `.panel { width:800px;
// height:min(800px,100vh - 48px) }` with no token indirection, and each
// section caps its own content column at 720–760px. Widening the panel alone
// therefore changes little, so this plugin overrides both layers and exposes
// the numbers as a Settings → General row.
//
// Selector note: the rule targets the panel structurally
// (`div[role="presentation"] > div[role="dialog"][aria-modal="true"]`) rather
// than the CSS-module class, whose hash changes with the file. That
// combination matches only the settings panel — the attachment lightbox is
// also role=dialog + aria-modal, but it is a portal root, not a child of a
// role=presentation container.
//
// Persistence note: the size lives in localStorage. DSH's Host settings wire
// only exposes an allowlisted set of namespaces to browser clients
// (dsh-host-apiproxy's WEB_SETTINGS_NAMESPACES), so a third-party namespace
// would answer `settings-not-exposed`; a dialog size is a per-browser visual
// preference, which matches the boundary the product already keeps for remote
// browser preferences while still surviving reloads on the same origin.
window.__ModuleLoader__.load({
	id: "dsh-settings-size",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		//#region dsh-settings-size: definitions
		/** localStorage key holding the chosen size as `"<width>x<height>"`. */
		const STORAGE_KEY = "dsh-settings-size:size";
		/** Size a user who never touched the row gets (the shipped 800x800 feels cramped). */
		const DEFAULT_SIZE = { w: 1080, h: 900 };
		/**
		 * DSH's own dialog size. This is what the reset button restores: "default"
		 * for the dialog means the size the product ships, not this plugin's
		 * starting size.
		 */
		const SHIPPED_SIZE = { w: 800, h: 800 };
		/** Slider bounds; also the clamp applied when reading back a stored value. */
		const MIN_W = 640;
		const MAX_W = 3000;
		const MIN_H = 560;
		const MAX_H = 2000;
		/** Viewport gutter kept free on every side, mirroring the shipped `- 48px` intent. */
		const GUTTER = 32;
		/** Locale namespace owning this row's strings. */
		const SETTINGS_NS = "settings.size";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"size.title": "设置弹框尺寸",
			"size.standard": "标准",
			"size.large": "大",
			"size.xl": "超大",
			"size.max": "近全屏",
			"size.width": "宽度",
			"size.height": "高度",
			"size.hint": "当前 {w} × {h} px · 超出屏幕时自动收窄 · 仅保存在本浏览器",
			"size.reset": "恢复默认"
		};
		/** English dictionary, same key set. */
		const en = {
			"size.title": "Dialog size",
			"size.standard": "Standard",
			"size.large": "Large",
			"size.xl": "XL",
			"size.max": "Near fullscreen",
			"size.width": "Width",
			"size.height": "Height",
			"size.hint": "Current {w} × {h} px · clamped to the viewport · saved in this browser",
			"size.reset": "Reset"
		};
		/**
		 * One-click sizes. `max` deliberately overflows, so min() clamps it to the
		 * viewport; `sized` marks the presets whose label carries its dimensions.
		 */
		const PRESETS = [
			{ id: "std", key: "size.standard", w: SHIPPED_SIZE.w, h: SHIPPED_SIZE.h, sized: true },
			{ id: "lg", key: "size.large", w: 1080, h: 900, sized: true },
			{ id: "xl", key: "size.xl", w: 1400, h: 1080, sized: true },
			{ id: "max", key: "size.max", w: 3000, h: 2000, sized: false }
		];
		/** Structural selector for the settings panel (never the hashed class). */
		const PANEL = 'div[role="presentation"] > div[role="dialog"][aria-modal="true"]';
		//#endregion

		//#region dsh-settings-size: row styles
		// Inline styles only, so the row inherits the shell's light/dark theme
		// through real --dsw-* tokens. Deliberately NOT named `styles`: that name
		// is reserved for an injected builtin in the dynamic-plugin runner, and
		// shadowing it there made styles.insert silently unreachable.
		const ui = {
			group: {
				borderBottom: "1px solid var(--dsw-alias-border-l2)",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				padding: "16px 0"
			},
			title: {
				color: "var(--dsw-alias-label-primary)",
				fontSize: "14px",
				fontWeight: 400,
				lineHeight: "22px"
			},
			hint: {
				color: "var(--dsw-alias-label-tertiary)",
				fontSize: "12px",
				lineHeight: "18px"
			},
			grid: {
				display: "flex",
				flexWrap: "wrap",
				gap: "8px"
			},
			chip: {
				font: "inherit",
				fontSize: "13px",
				lineHeight: "20px",
				padding: "4px 12px",
				borderRadius: "999px",
				background: "transparent",
				// Mirrors ui-theme's Appearance cubes: every option keeps a
				// hairline border, and selection swaps it for the brighter rule
				// instead of removing it.
				border: "0.5px solid var(--dsw-alias-border-l4)",
				color: "var(--dsw-alias-label-primary)",
				cursor: "pointer",
				boxSizing: "border-box"
			},
			chipActive: {
				// `border` in BOTH states on purpose. Mixing the `border` shorthand
				// with a `borderColor` longhand makes React clear the longhand alone
				// on deactivate: the shorthand has already expanded into
				// border-width/style, so the colour falls back to `currentColor`
				// and every preset that was ever selected keeps a border.
				border: "0.5px solid var(--dsw-static-neutral-bluish-400)",
				background: "var(--dsw-alias-bg-module-platform)",
				color: "var(--dsw-alias-label-primary)"
			},
			sliderRow: {
				display: "flex",
				alignItems: "center",
				gap: "10px",
				minWidth: "240px"
			},
			sliderLabel: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "13px",
				whiteSpace: "nowrap",
				width: "52px"
			},
			slider: {
				flex: 1,
				accentColor: "var(--dsw-alias-brand-primary)"
			},
			sliderValue: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "12px",
				whiteSpace: "nowrap",
				width: "52px",
				textAlign: "right",
				fontVariantNumeric: "tabular-nums"
			},
			smallButton: {
				font: "inherit",
				fontSize: "11px",
				lineHeight: "16px",
				padding: "2px 8px",
				borderRadius: "6px",
				background: "transparent",
				border: "1px solid var(--dsw-alias-border-l2)",
				color: "var(--dsw-alias-label-secondary)",
				cursor: "pointer"
			}
		};
		//#endregion

		//#region dsh-settings-size: css + storage
		/**
		 * Build the override stylesheet for one size.
		 * @param w - target panel width in px.
		 * @param h - target panel height in px.
		 * @returns the CSS text.
		 */
		function overrideCss(w, h) {
			return [
				"/* dsh-settings-size: settings dialog frame */",
				PANEL + "{width:min(" + w + "px,calc(100vw - " + GUTTER + "px)) !important;height:min(" + h + "px,calc(100vh - " + GUTTER + "px)) !important;max-width:calc(100vw - " + GUTTER + "px) !important;}",
				// The panel alone is not enough: each section caps its own content
				// column at 720–760px, so the extra width would stay empty.
				PANEL + ' [class*="_section"]{max-width:none !important;}'
			].join("\n");
		}

		/** Clamp one numeric dimension into its slider range. */
		function clamp(value, min, max) {
			if (!Number.isFinite(value)) return min;
			return Math.min(max, Math.max(min, Math.round(value)));
		}

		/**
		 * Read the stored size, falling back to the default when absent or unusable.
		 * @returns `{ w, h }` already clamped to the slider bounds.
		 */
		function readStoredSize() {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw === null) return { w: DEFAULT_SIZE.w, h: DEFAULT_SIZE.h };
				const parts = String(raw).split("x");
				return {
					w: clamp(Number(parts[0]), MIN_W, MAX_W),
					h: clamp(Number(parts[1]), MIN_H, MAX_H)
				};
			} catch (error) {
				// Private mode / storage disabled: run with the default, never throw.
				return { w: DEFAULT_SIZE.w, h: DEFAULT_SIZE.h };
			}
		}

		/**
		 * Persist the chosen size. Failures stay silent: an unwritable storage
		 * must not break the live resize.
		 * @param size - the size to store.
		 */
		function writeStoredSize(size) {
			try {
				localStorage.setItem(STORAGE_KEY, size.w + "x" + size.h);
			} catch (error) {
				/* storage unavailable — the current session still works */
			}
		}
		//#endregion

		//#region dsh-settings-size: shared size store
		/** Live size, shared by the mounted row and the stylesheet. */
		let current = readStoredSize();
		/** State setters of mounted rows, notified after every change. */
		const watchers = new Set();
		/** The plugin-owned <style> tag, or null while the plugin is unloaded. */
		let sheet = null;

		/**
		 * Apply one size everywhere: stylesheet, storage, mounted row.
		 * Module level on purpose — the row's click and slider handlers must
		 * reach this function, not the row's own React state setter.
		 * @param w - target width in px.
		 * @param h - target height in px.
		 */
		function setSize(w, h) {
			current = { w: clamp(w, MIN_W, MAX_W), h: clamp(h, MIN_H, MAX_H) };
			if (sheet !== null) sheet.textContent = overrideCss(current.w, current.h);
			writeStoredSize(current);
			watchers.forEach((watcher) => watcher(current));
		}
		//#endregion

		//#region dsh-settings-size: row component
		/**
		 * The Settings → General row: presets, two sliders, current value, reset.
		 * Strings arrive as `props.t`, bound to SETTINGS_NS by the slot's `locale`
		 * option; the fallback keeps the row renderable if that wiring is missing.
		 * @param props - slot props carrying the namespace-bound translator.
		 * @returns the row element.
		 */
		function SettingsSizeRow(props) {
			const t = props && props.t !== void 0 ? props.t : (key) => key;
			// Named `publish`, not `setSize`: a local `setSize` would shadow the
			// module-level one, and React's state setter takes a single argument —
			// so `setSize(1080, 900)` from a preset would store the number 1080.
			const [size, publish] = React.useState(current);
			React.useEffect(() => {
				watchers.add(publish);
				return () => {
					watchers.delete(publish);
				};
			}, []);
			const sliderRow = (label, value, min, max, onInput) => React.createElement("div", {
				style: ui.sliderRow
			}, React.createElement("span", {
				style: ui.sliderLabel
			}, label), React.createElement("input", {
				type: "range",
				min,
				max,
				step: 10,
				value,
				"aria-label": label,
				onChange: (event) => onInput(Number(event.target.value)),
				style: ui.slider
			}), React.createElement("span", {
				style: ui.sliderValue
			}, String(value) + " px"));
			return React.createElement("div", {
				style: ui.group
			}, React.createElement("div", {
				style: ui.title
			}, t("size.title")), React.createElement("div", {
				style: ui.grid
			}, PRESETS.map((preset) => {
				const active = size.w === preset.w && size.h === preset.h;
				const label = t(preset.key) + (preset.sized ? " " + preset.w + "×" + preset.h : "");
				return React.createElement("button", {
					key: preset.id,
					type: "button",
					"aria-pressed": active,
					onClick: () => setSize(preset.w, preset.h),
					style: active ? { ...ui.chip, ...ui.chipActive } : ui.chip
				}, label);
			})), sliderRow(t("size.width"), size.w, MIN_W, MAX_W, (value) => setSize(value, size.h)), sliderRow(t("size.height"), size.h, MIN_H, MAX_H, (value) => setSize(size.w, value)), React.createElement("div", {
				style: ui.hint
			}, t("size.hint", { w: size.w, h: size.h })), React.createElement("div", {
				style: ui.grid
			}, React.createElement("button", {
				type: "button",
				onClick: () => setSize(SHIPPED_SIZE.w, SHIPPED_SIZE.h),
				style: ui.smallButton
			}, t("size.reset") + " " + SHIPPED_SIZE.w + "×" + SHIPPED_SIZE.h)));
		}
		//#endregion

		//#region dsh-settings-size: client plugin
		/**
		 * Client plugin body: keep one owned <style> tag in sync with the shared
		 * size and register the General row.
		 * @param ctx - client cordis context.
		 */
		function apply(ctx) {
			const styleTag = document.createElement("style");
			styleTag.dataset.plugin = "dsh-settings-size";
			document.head.appendChild(styleTag);
			sheet = styleTag;
			ctx.effect(() => () => {
				watchers.clear();
				if (sheet === styleTag) sheet = null;
				styleTag.remove();
			});

			setSize(current.w, current.h);

			// Registering the dictionary under `locale` on the slot registration is
			// what makes the owner pass a namespace-bound `t` and re-render the row
			// whenever the active language changes.
			ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "dsh-settings-size: row dictionaries");

			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "settings-size",
				order: 15,
				locale: SETTINGS_NS
			}, (props) => React.createElement(SettingsSizeRow, props)));
		}

		/** Services this plugin needs before it may apply. */
		const inject = ["slots", "locale"];
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
