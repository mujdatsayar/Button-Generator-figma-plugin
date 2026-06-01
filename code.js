/**
 * ========================================
 * BUTTON GENERATOR PRO - Figma Plugin
 * ========================================
 */

// MATERIAL DESIGN & INDUSTRY STANDARD BUTTON SIZES (8px Grid System)
var SIZE_CONFIG = {
    xs: {
        height: 24,           // 8 * 3
        fontSize: 12,
        paddingX: 8,
        paddingXWithIcon: 8,
        iconSize: 14,
        iconGap: 4
    },
    sm: {
        height: 32,           // 8 * 4
        fontSize: 12,
        paddingX: 12,
        paddingXWithIcon: 12,
        iconSize: 16,
        iconGap: 4
    },
    md: {
        height: 40,           // 8 * 5
        fontSize: 14,
        paddingX: 16,
        paddingXWithIcon: 16,
        iconSize: 20,
        iconGap: 8
    },
    lg: {
        height: 48,           // 8 * 6
        fontSize: 16,
        paddingX: 24,
        paddingXWithIcon: 24,
        iconSize: 24,
        iconGap: 8
    },
    xl: {
        height: 56,           // 8 * 7
        fontSize: 18,
        paddingX: 32,
        paddingXWithIcon: 32,
        iconSize: 24,
        iconGap: 12
    }
};

// COLOR ADJUSTMENTS - UI ile aynı opacity değerleri
var COLOR_ADJUSTMENTS = {
    solid: {
        default: { l: 0, s: 0 },
        hover: { l: -8, s: 0 },
        pressed: { l: -15, s: 0 },
        focused: { l: 0, s: 0 },
        disabled: { l: 20, s: -60 },
        loading: { l: 0, s: 0 }  // Loading için varsayılan renk
    },
    outline: {
        bgOpacity: { default: 0, hover: 0.1, pressed: 0.18, focused: 0, disabled: 0, loading: 0 }
    }
};

// COLOR UTILITIES
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };
    return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    };
}

function hexToHSL(hex) {
    var rgb = hexToRgb(hex);
    var r = rgb.r, g = rgb.g, b = rgb.b;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    h = h / 360; s = s / 100; l = l / 100;

    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    var r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    function toHex(x) {
        var hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Generate Color States (Material Design Approach)
 * - Hover/Pressed: Darken the base color
 * - Disabled: Keep original hue, create pastel version (Se�enek A)
 * - Special case: Grayscale colors use neutral gray
 * SYNCHRONIZED with ui.html
 */
function generateColorStates(baseHex) {
    var hsl = hexToHSL(baseHex);

    // Grayscale kontrol�: Saturation �ok d���kse veya lightness �ok d���kse
    // Bu durumda hue de�eri anlams�z (siyah i�in hue=0=KIRMIZI olur!)
    var isGrayscale = hsl.s < 10 || hsl.l < 5;

    // Disabled renkler
    var disabledBg, disabledBorder;

    if (isGrayscale) {
        // N�tr gri kullan (hue olmadan)
        disabledBg = '#E2E8F0';      // Slate-200
        disabledBorder = '#CBD5E1';  // Slate-300
    } else {
        // Orijinal hue'yu koru, pastel versiyonu olu�tur
        disabledBg = hslToHex(hsl.h, Math.max(20, hsl.s - 40), 90);
        disabledBorder = hslToHex(hsl.h, Math.max(15, hsl.s - 50), 80);
    }

    if (hsl.l > 90) {
        // �ok a��k renkler i�in (beyaza yak�n) - az karartma
        var hoverL = Math.max(0, hsl.l - 3);
        var pressedL = Math.max(0, hsl.l - 6);

        return {
            default: baseHex,
            hover: hslToHex(hsl.h, hsl.s, hoverL),
            pressed: hslToHex(hsl.h, hsl.s, pressedL),
            focused: baseHex,
            disabled: disabledBg,
            disabledBorder: disabledBorder,
            loading: baseHex
        };
    } else if (hsl.l < 15) {
        // �OK KOYU RENKLER (siyaha yak�n) - A�IKLA�TIR
        // Siyah� daha da karartamazs�n, bu y�zden hover'da a��kla�t�r
        var hoverL = Math.min(100, hsl.l + 8);
        var pressedL = Math.min(100, hsl.l + 15);

        return {
            default: baseHex,
            hover: hslToHex(hsl.h, hsl.s, hoverL),
            pressed: hslToHex(hsl.h, hsl.s, pressedL),
            focused: baseHex,
            disabled: disabledBg,
            disabledBorder: disabledBorder,
            loading: baseHex
        };
    } else if (hsl.l > 75) {
        // A��k renkler i�in - orta karartma
        var hoverL = Math.max(0, hsl.l - 5);
        var pressedL = Math.max(0, hsl.l - 10);

        return {
            default: baseHex,
            hover: hslToHex(hsl.h, hsl.s, hoverL),
            pressed: hslToHex(hsl.h, hsl.s, pressedL),
            focused: baseHex,
            disabled: disabledBg,
            disabledBorder: disabledBorder,
            loading: baseHex
        };
    }

    // Normal renkler i�in - standart karartma
    var hoverL = Math.max(0, hsl.l - 8);
    var pressedL = Math.max(0, hsl.l - 15);

    return {
        default: baseHex,
        hover: hslToHex(hsl.h, hsl.s, hoverL),
        pressed: hslToHex(hsl.h, hsl.s, pressedL),
        focused: baseHex,
        disabled: disabledBg,
        disabledBorder: disabledBorder,
        loading: baseHex
    };
}

/**
 * V2 Layout için Component Set dışına text etiketleri oluşturur
 * Basitleştirilmiş versiyon - sadece ana başlıklar
 */
function createV2Labels(componentSet, config) {
    var hierarchies = config.hierarchies;
    var variants = config.variants;
    var sizes = config.sizes;
    var states = config.states;
    var colors = config.colors;
    var icons = config.icons;

    var labels = [];

    // Component Set'in üstüne yeterli boşluk bırak
    var LABEL_OFFSET_Y = 120; // Component set'in üstünden ne kadar yukarıda olacak

    // Ana Başlık - Component Set'in çok üstünde
    var mainTitle = figma.createText();
    mainTitle.characters = "BUTTON COMPONENT SET";
    mainTitle.fontSize = 32;
    mainTitle.fontName = { family: "Inter", style: "Bold" };
    mainTitle.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
    mainTitle.x = componentSet.x;
    mainTitle.y = componentSet.y - LABEL_OFFSET_Y - 40;
    labels.push(mainTitle);

    // Alt Başlık - Bilgi satırı
    var infoText = figma.createText();
    infoText.characters = hierarchies.length + " Hierarchies • " + variants.length + " Variants • " + sizes.length + " Sizes • " + states.length + " States";
    infoText.fontSize = 14;
    infoText.fontName = { family: "Inter", style: "Medium" };
    infoText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    infoText.x = componentSet.x;
    infoText.y = componentSet.y - LABEL_OFFSET_Y;
    labels.push(infoText);

    // Hierarchy renk paleti
    var colorPaletteY = componentSet.y - LABEL_OFFSET_Y;
    var colorPaletteX = componentSet.x + 500;

    for (var h = 0; h < hierarchies.length; h++) {
        var hierarchy = hierarchies[h];
        var hierarchyColor = colors[hierarchy] || '#3B82F6';

        // Renk kutusu (frame olarak)
        var colorBox = figma.createFrame();
        colorBox.resize(16, 16);
        colorBox.cornerRadius = 4;
        colorBox.fills = [{ type: 'SOLID', color: hexToRgb(hierarchyColor) }];
        colorBox.x = colorPaletteX;
        colorBox.y = colorPaletteY;
        labels.push(colorBox);

        // Hierarchy ismi
        var hierarchyLabel = figma.createText();
        hierarchyLabel.characters = hierarchy.charAt(0).toUpperCase() + hierarchy.slice(1);
        hierarchyLabel.fontSize = 12;
        hierarchyLabel.fontName = { family: "Inter", style: "Medium" };
        hierarchyLabel.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
        hierarchyLabel.x = colorPaletteX + 22;
        hierarchyLabel.y = colorPaletteY + 1;
        labels.push(hierarchyLabel);

        colorPaletteX += 100;
    }

    // Sol tarafta Size Legend - Component set'in solunda
    var sizeLegendY = componentSet.y + 20;
    var sizeLegendX = componentSet.x - 150;


    var sizeLegendTitle = figma.createText();
    sizeLegendTitle.characters = "SIZES";
    sizeLegendTitle.fontSize = 10;
    sizeLegendTitle.fontName = { family: "Inter", style: "Bold" };
    sizeLegendTitle.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    sizeLegendTitle.x = sizeLegendX;
    sizeLegendTitle.y = sizeLegendY;
    labels.push(sizeLegendTitle);

    sizeLegendY += 20;

    for (var s = 0; s < sizes.length; s++) {
        var sizeLabel = figma.createText();
        sizeLabel.characters = sizes[s].toUpperCase() + " - " + SIZE_CONFIG[sizes[s]].height + "px";
        sizeLabel.fontSize = 11;
        sizeLabel.fontName = { family: "Inter", style: "Regular" };
        sizeLabel.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
        sizeLabel.x = sizeLegendX;
        sizeLabel.y = sizeLegendY;
        labels.push(sizeLabel);
        sizeLegendY += 18;
    }

    // States Legend
    sizeLegendY += 20;

    var statesLegendTitle = figma.createText();
    statesLegendTitle.characters = "STATES";
    statesLegendTitle.fontSize = 10;
    statesLegendTitle.fontName = { family: "Inter", style: "Bold" };
    statesLegendTitle.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    statesLegendTitle.x = sizeLegendX;
    statesLegendTitle.y = sizeLegendY;
    labels.push(statesLegendTitle);

    sizeLegendY += 20;

    for (var st = 0; st < states.length; st++) {
        var stateLabel = figma.createText();
        stateLabel.characters = states[st].charAt(0).toUpperCase() + states[st].slice(1);
        stateLabel.fontSize = 11;
        stateLabel.fontName = { family: "Inter", style: "Regular" };
        stateLabel.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
        stateLabel.x = sizeLegendX;
        stateLabel.y = sizeLegendY;
        labels.push(stateLabel);
        sizeLegendY += 18;
    }

    // Tüm etiketleri bir frame içine topla
    var labelsFrame = figma.createFrame();
    labelsFrame.name = "Button Documentation Labels";
    labelsFrame.fills = [];
    labelsFrame.clipsContent = false;
    labelsFrame.layoutMode = "NONE";

    // Labels'ı page'e ekleyip pozisyonlarını koru
    for (var i = 0; i < labels.length; i++) {
        var originalX = labels[i].x;
        var originalY = labels[i].y;
        figma.currentPage.appendChild(labels[i]);
        labels[i].x = originalX;
        labels[i].y = originalY;
    }

    return null; // Frame kullanmıyoruz, direkt page'e ekliyoruz
}

/**
 * WCAG AA Compliant Contrast Color Selector
 * Matches ui.html implementation exactly
 * 
 * Algoritma:
 * 1. Beyaz ve siyah i�in kontrast oranlar�n� hesapla
 * 2. Her ikisinin de WCAG AA'y� (4.5:1) ge�ip ge�medi�ini kontrol et
 * 3. �kisi de ge�iyorsa � daha y�ksek kontrast� se�
 * 4. Sadece biri ge�iyorsa � onu se�
 * 5. Hi�biri ge�miyorsa � daha y�ksek kontrast� se� (en az k�t�)
 */
function getContrastColor(bgHex) {
    var WHITE = '#FFFFFF';
    var BLACK = '#000000';
    var WCAG_AA = 4.5;

    var contrastWhite = getContrastRatio(bgHex, WHITE);
    var contrastBlack = getContrastRatio(bgHex, BLACK);

    var whitePassesAA = contrastWhite >= WCAG_AA;
    var blackPassesAA = contrastBlack >= WCAG_AA;

    // Karar tablosu:
    // | White AA | Black AA | Se�im                           |
    // |----------|----------|----------------------------------|
    // | ?        | ?        | Daha y�ksek kontrast             |
    // | ?        | ?        | Beyaz                            |
    // | ?        | ?        | Siyah                            |
    // | ?        | ?        | Daha y�ksek kontrast (fallback)  |

    if (whitePassesAA && blackPassesAA) {
        // �kisi de AA'y� ge�iyor � daha y�ksek kontrast� se�
        return contrastWhite >= contrastBlack ? WHITE : BLACK;
    } else if (whitePassesAA) {
        return WHITE;
    } else if (blackPassesAA) {
        return BLACK;
    } else {
        // Hi�biri AA'y� ge�miyor � daha y�ksek kontrast� se� (fallback)
        return contrastWhite >= contrastBlack ? WHITE : BLACK;
    }
}

// UI ile aynı - Açık renk kontrolü
function isLightColor(hex) {
    var hsl = hexToHSL(hex);
    return hsl.l > 85;
}

// UI ile aynı - Opacity ile renk
function colorWithOpacity(hex, opacity) {
    var rgb = hexToRgb(hex);
    return 'rgba(' + Math.round(rgb.r * 255) + ', ' + Math.round(rgb.g * 255) + ', ' + Math.round(rgb.b * 255) + ', ' + opacity + ')';
}

// WCAG 2.2 Relative Luminance Calculator
function getRelativeLuminance(hex) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;

    var linearize = function (c) {
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    r = linearize(r);
    g = linearize(g);
    b = linearize(b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG 2.2 Contrast Ratio
function getContrastRatio(color1, color2) {
    var lum1 = getRelativeLuminance(color1);
    var lum2 = getRelativeLuminance(color2);
    var lighter = Math.max(lum1, lum2);
    var darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

// WCAG uyumlu accessible text rengi
function getAccessibleTextColor(color, bgColor) {
    var WCAG_AA = 4.5;
    var currentContrast = getContrastRatio(color, bgColor);

    if (currentContrast >= WCAG_AA) {
        return color;
    }

    // Rengi koyulaştır
    var hsl = hexToHSL(color);
    var newL = hsl.l;

    while (newL > 0) {
        newL -= 5;
        var newColor = hslToHex(hsl.h, hsl.s, newL);
        if (getContrastRatio(newColor, bgColor) >= WCAG_AA) {
            return newColor;
        }
    }

    return '#000000';
}

// MASTER ICON COMPONENT
var masterIconComponent = null;

function createMasterIconComponent() {
    var iconFrame = figma.createFrame();
    iconFrame.name = "Icon / Plus";
    iconFrame.resize(24, 24);
    iconFrame.fills = [];
    iconFrame.clipsContent = false;

    var plus = figma.createVector();
    plus.name = "Plus";
    plus.vectorPaths = [{
        windingRule: "NONE",
        data: "M 12 5 L 12 19 M 5 12 L 19 12"
    }];
    plus.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    plus.strokeWeight = 2;
    plus.strokeCap = "ROUND";
    plus.strokeJoin = "ROUND";
    plus.fills = [];
    plus.constraints = { horizontal: "SCALE", vertical: "SCALE" };

    iconFrame.appendChild(plus);
    plus.x = 0;
    plus.y = 0;
    plus.resize(24, 24);

    var component = figma.createComponentFromNode(iconFrame);
    component.name = "Icon / Plus";
    component.description = "Master icon component - 24x24. All button icons are instances of this.";

    return component;
}

// MASTER SPINNER ICON COMPONENT - Loading state için
var masterSpinnerComponent = null;

function createMasterSpinnerComponent() {
    var iconFrame = figma.createFrame();
    iconFrame.name = "Icon / Spinner";
    iconFrame.resize(24, 24);
    iconFrame.fills = [];
    iconFrame.clipsContent = false;

    // Spinner çemberi - Lucide loader-2 benzeri
    var spinner = figma.createEllipse();
    spinner.name = "Spinner";
    spinner.resize(20, 20);
    spinner.x = 2;
    spinner.y = 2;
    spinner.fills = [];
    spinner.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    spinner.strokeWeight = 2;
    spinner.strokeCap = "ROUND";
    spinner.arcData = { startingAngle: 0, endingAngle: 4.71, innerRadius: 0.8 }; // 270 derece arc
    spinner.constraints = { horizontal: "SCALE", vertical: "SCALE" };

    iconFrame.appendChild(spinner);

    var component = figma.createComponentFromNode(iconFrame);
    component.name = "Icon / Spinner";
    component.description = "Master spinner icon component - 24x24. Used for Loading state buttons.";

    return component;
}

function createIconInstance(masterIcon, size, color) {
    if (!masterIcon) return null;
    var instance = masterIcon.createInstance();
    instance.name = "Icon";
    instance.resize(size, size);

    // Find the vector shape inside the icon (Plus, Arrow, or Spinner)
    var shape = instance.findOne(function (n) { return n.name === "Plus" || n.name === "Arrow" || n.name === "Spinner"; });
    if (shape) {
        shape.strokes = [{ type: 'SOLID', color: color }];
    }

    return instance;
}

function getShadowEffects(type) {
    var effects = [];
    var shadowColor = { r: 10 / 255, g: 13 / 255, b: 18 / 255, a: 0.1 };
    var shadowColorXS = { r: 10 / 255, g: 13 / 255, b: 18 / 255, a: 0.05 };

    if (type === 'sm') {
        effects.push({
            type: "DROP_SHADOW",
            color: shadowColor,
            offset: { x: 0, y: 1 },
            radius: 3,
            spread: 0,
            visible: true,
            blendMode: "NORMAL"
        });
        effects.push({
            type: "DROP_SHADOW",
            color: shadowColor,
            offset: { x: 0, y: 1 },
            radius: 2,
            spread: -1,
            visible: true,
            blendMode: "NORMAL"
        });
    } else if (type === 'xs') {
        effects.push({
            type: "DROP_SHADOW",
            color: shadowColorXS,
            offset: { x: 0, y: 1 },
            radius: 2,
            spread: 0,
            visible: true,
            blendMode: "NORMAL"
        });
    }
    return effects;
}

function createButtonVariant(config, masterIcon) {
    console.log('🔘 createButtonVariant config.label:', config.label);
    var sizeConfig = SIZE_CONFIG[config.size];
    var baseColor = config.color;
    var stateColor = config.colorStates[config.state] || config.color;
    // Base Color helpers
    var isLight = isLightColor(baseColor);
    var baseHsl = hexToHSL(baseColor);
    var isVeryLight = baseHsl.l > 90;

    // --- COLOR PALETTE (as per ui.html / Design System) ---
    // Disabled (Material Design - Se�enek A: Pastel of original color)
    var disabledBgHex = config.colorStates.disabled || '#E2E8F0';
    var disabledBorderHex = config.colorStates.disabledBorder || '#CBD5E1';
    var disabledFill = hexToRgb(disabledBgHex);
    var disabledText = { r: 0.278, g: 0.333, b: 0.412 };   // #475569 (WCAG AA ?)
    var disabledBorder = hexToRgb(disabledBorderHex);

    // Light Mode Alts
    var lightAltColor = { r: 0.392, g: 0.455, b: 0.545 };     // #64748B
    var lightBorderColor = { r: 0.796, g: 0.835, b: 0.882 };  // #CBD5E1
    var blackOverlay = { r: 0, g: 0, b: 0 };
    var white = { r: 1, g: 1, b: 1 };

    // Initial Values
    var fills = [];
    var strokes = [];
    var textColorRgb = white;
    var strokeW = 0;

    // --- 1. STATE & COLOR LOGIC ---
    var isDisabled = config.state === 'disabled' || config.state === 'Disabled' || (config.state && config.state.toLowerCase() === 'disabled');

    if (isDisabled) {
        console.log('?? DISABLED STATE APPLIED for:', config.variant, '- Text Color:', JSON.stringify(disabledText));
        textColorRgb = disabledText;
        if (config.variant === 'solid') {
            fills = [{ type: 'SOLID', color: disabledFill }];
        } else if (config.variant === 'outline') {
            strokes = [{ type: 'SOLID', color: disabledBorder }];
            strokeW = 1;
        }
        // Link/Ghost: transparent bg, no stroke - text already set to disabledText
    } else {
        // NORMAL / HOVER / PRESSED / LOADING / FOCUSED
        var stateRgb = hexToRgb(stateColor);
        var baseRgb = hexToRgb(baseColor);

        // Text Color - varies by variant AND state
        if (config.variant === 'solid') {
            // Text contrast against Pressed state (consistent)
            var pressedColor = config.colorStates.pressed || baseColor;
            var contrastHex = getContrastColor(pressedColor);
            textColorRgb = hexToRgb(contrastHex);
        } else if (config.variant === 'link') {
            // Link: Text color changes with state (like popular design systems)
            if (isLight) {
                textColorRgb = lightAltColor;
            } else {
                // Use colorStates for hover/pressed to show visual feedback
                var linkStateColor = config.colorStates[config.state] || baseColor;
                var accHex = getAccessibleTextColor(linkStateColor, '#FFFFFF');
                textColorRgb = hexToRgb(accHex);
            }
        } else {
            // Outline/Ghost - same text color for all states (bg changes instead)
            if (isLight) {
                textColorRgb = lightAltColor;
            } else {
                var accHex = getAccessibleTextColor(baseColor, '#FFFFFF');
                textColorRgb = hexToRgb(accHex);
            }
        }

        switch (config.variant) {
            case 'solid':
                fills = [{ type: 'SOLID', color: stateRgb }];
                if (isLight) {
                    strokes = [{ type: 'SOLID', color: lightBorderColor }];
                    strokeW = 1;
                }
                break;

            case 'outline':
                if (isLight) {
                    strokes = [{ type: 'SOLID', color: lightBorderColor }];
                    strokeW = 1;
                    var overlayColor = isVeryLight ? blackOverlay : baseRgb;
                    if (config.state === 'hover') {
                        fills = [{ type: 'SOLID', color: overlayColor, opacity: isVeryLight ? 0.04 : 0.08 }];
                    } else if (config.state === 'pressed') {
                        fills = [{ type: 'SOLID', color: overlayColor, opacity: isVeryLight ? 0.08 : 0.15 }];
                    }
                } else {
                    strokes = [{ type: 'SOLID', color: textColorRgb }];
                    strokeW = 1;
                    if (config.state === 'hover') {
                        fills = [{ type: 'SOLID', color: baseRgb, opacity: 0.1 }];
                    } else if (config.state === 'pressed') {
                        fills = [{ type: 'SOLID', color: baseRgb, opacity: 0.18 }];
                    }
                }
                break;

            case 'ghost':
                if (isLight) {
                    var overlayColor = isVeryLight ? blackOverlay : baseRgb;
                    if (config.state === 'hover') {
                        fills = [{ type: 'SOLID', color: overlayColor, opacity: isVeryLight ? 0.04 : 0.08 }];
                    } else if (config.state === 'pressed') {
                        fills = [{ type: 'SOLID', color: overlayColor, opacity: isVeryLight ? 0.08 : 0.15 }];
                    }
                } else {
                    if (config.state === 'hover') {
                        fills = [{ type: 'SOLID', color: baseRgb, opacity: 0.08 }];
                    } else if (config.state === 'pressed') {
                        fills = [{ type: 'SOLID', color: baseRgb, opacity: 0.15 }];
                    }
                }
                break;

            case 'link':
                // Hover/Pressed handled via text decoration usually, but no bg change in standard
                break;
        }
    }

    // --- 2. FRAME SETUP ---
    var button = figma.createFrame();

    // Naming
    var variantName = "Hierarchy=" + config.hierarchy + ", Variant=" + config.variant + ", Size=" + config.size.toUpperCase() + ", State=" + config.state;
    if (config.includeIconOnly) variantName += ", IconOnly=" + config.iconOnly;
    if (config.includeRadius && config.radius !== undefined) variantName += ", Radius=" + config.radius;
    if (config.shadow && config.shadow !== 'none') variantName += ", Shadow=" + config.shadow.toUpperCase();
    if (config.shadow === 'none') variantName += ", Shadow=None";
    button.name = variantName;

    // Layout
    button.layoutMode = "HORIZONTAL";
    button.primaryAxisAlignItems = "CENTER";
    button.counterAxisAlignItems = "CENTER";
    button.itemSpacing = sizeConfig.iconGap;

    // Padding Logic
    var paddingX = sizeConfig.paddingX;
    if (!config.iconOnly && (config.showLeftIcon || config.showRightIcon)) {
        if (sizeConfig.paddingXWithIcon) paddingX = sizeConfig.paddingXWithIcon;
    }

    if (config.iconOnly) {
        button.resize(sizeConfig.height, sizeConfig.height);
        button.paddingLeft = 0;
        button.paddingRight = 0;
        button.primaryAxisSizingMode = "FIXED";
        button.counterAxisSizingMode = "FIXED";
    } else {
        button.paddingLeft = paddingX;
        button.paddingRight = paddingX;
        button.layoutSizingHorizontal = "HUG";
        button.layoutSizingVertical = "HUG";
        button.paddingTop = 0;
        button.paddingBottom = 0;
        button.minHeight = sizeConfig.height;
        button.maxHeight = sizeConfig.height;
    }

    // Radius
    var radiusVal = config.radius !== undefined ? config.radius : (sizeConfig.radius || 0);
    button.cornerRadius = (radiusVal === 9999) ? sizeConfig.height / 2 : radiusVal;

    // OVERRIDE COLORS
    if (config.override) {
        if (config.override.backgroundColor) {
            fills = [{ type: 'SOLID', color: hexToRgb(config.override.backgroundColor) }];
        }
        if (config.override.borderColor) {
            strokes = [{ type: 'SOLID', color: hexToRgb(config.override.borderColor) }];
            if (strokeW === 0) strokeW = 1;
        }
        if (config.override.color) {
            textColorRgb = hexToRgb(config.override.color);
        }
    }

    // Apply Colors
    button.fills = fills;
    button.strokes = strokes;
    button.strokeWeight = strokeW;

    // Focus Effect
    if (config.state === 'focused' && !config.state.includes('disabled')) {
        var focusRgb = hexToRgb(baseColor);
        button.effects = [{
            type: 'DROP_SHADOW',
            color: { r: focusRgb.r, g: focusRgb.g, b: focusRgb.b, a: 0.4 },
            offset: { x: 0, y: 0 },
            radius: 0,
            spread: 3,
            visible: true,
            blendMode: 'NORMAL'
        }];
    }

    // Shadow Property Effect (ONLY for solid variant)
    if (config.variant === 'solid' && (config.shadow === 'xs' || config.shadow === 'sm')) {
        var existingEffects = button.effects || [];
        button.effects = existingEffects.concat(getShadowEffects(config.shadow));
    }
    // Focused state usually implies z-index? Not in Figma auto-layout directly without absolute.

    // --- 3. CONTENT (Icons & Text) ---
    // Loading State
    if (config.state === 'loading') {
        if (config.masterSpinner) {
            var spinner = createIconInstance(config.masterSpinner, sizeConfig.iconSize, textColorRgb);
            spinner.name = "Spinner";
            button.appendChild(spinner);
        }
        if (!config.iconOnly) {
            var label = figma.createText();
            label.characters = "Loading...";
            label.fontSize = sizeConfig.fontSize;
            label.fontName = { family: "Inter", style: "Medium" };
            label.fills = [{ type: 'SOLID', color: textColorRgb }];
            label.name = "Label";
            button.appendChild(label);
        }
    } else {
        // Normal State
        if (config.iconOnly) {
            var iconToUse = masterIcon;
            // Ensure we have an icon
            if (iconToUse) {
                var icon = createIconInstance(iconToUse, sizeConfig.iconSize, textColorRgb);
                icon.name = "Icon";
                button.appendChild(icon);
            }
        } else {
            // Left Icon
            if (config.showLeftIcon && masterIcon) {
                var left = createIconInstance(masterIcon, sizeConfig.iconSize, textColorRgb);
                left.name = "LeftIcon";
                button.appendChild(left);
            }

            // Label
            var labelText = figma.createText();
            labelText.fontName = { family: "Inter", style: "Medium" }; // FONT FIRST!
            labelText.characters = config.label || "Button"; // Then text
            labelText.fontSize = sizeConfig.fontSize;
            labelText.fills = [{ type: 'SOLID', color: textColorRgb }];
            labelText.name = "Label";

            if (config.variant === 'link' && (config.state === 'hover' || config.state === 'pressed')) {
                labelText.textDecoration = "UNDERLINE";
            }
            button.appendChild(labelText);

            // Right Icon
            if (config.showRightIcon && masterIcon) {
                var right = createIconInstance(masterIcon, sizeConfig.iconSize, textColorRgb);
                right.name = "RightIcon";
                button.appendChild(right);
            }
        }
    }

    var component = figma.createComponentFromNode(button);
    return component;
}

function addComponentProperties(componentSet, masterIcon, icons, label) {
    try {
        // Property ekleme sırası Figma sidebar'daki görünüm sırasını belirler
        // Sıralama: ShowLeftIcon → LeftIcon → ShowRightIcon → RightIcon → ButtonLabel

        var showLeftProp = null;
        var leftSwapProp = null;
        var showRightProp = null;
        var rightSwapProp = null;
        var labelProp = null;

        // 1. ShowLeftIcon (Boolean toggle)
        if (icons.left) {
            try {
                showLeftProp = componentSet.addComponentProperty("ShowLeftIcon", "BOOLEAN", true);
                console.log("✅ ShowLeftIcon eklendi");
            } catch (e) {
                console.log("⚠️ ShowLeftIcon eklenemedi:", e.message);
            }
        }

        // 2. LeftIcon (Instance Swap)
        if (icons.left && masterIcon) {
            try {
                leftSwapProp = componentSet.addComponentProperty("LeftIcon", "INSTANCE_SWAP", masterIcon.id);
                console.log("✅ LeftIcon swap eklendi");
            } catch (e) {
                console.log("⚠️ LeftIcon swap eklenemedi:", e.message);
            }
        }

        // 3. ShowRightIcon (Boolean toggle)
        if (icons.right) {
            try {
                showRightProp = componentSet.addComponentProperty("ShowRightIcon", "BOOLEAN", true);
                console.log("✅ ShowRightIcon eklendi");
            } catch (e) {
                console.log("⚠️ ShowRightIcon eklenemedi:", e.message);
            }
        }

        // 4. RightIcon (Instance Swap)
        if (icons.right && masterIcon) {
            try {
                rightSwapProp = componentSet.addComponentProperty("RightIcon", "INSTANCE_SWAP", masterIcon.id);
                console.log("✅ RightIcon swap eklendi");
            } catch (e) {
                console.log("⚠️ RightIcon swap eklenemedi:", e.message);
            }
        }

        // 5. ButtonLabel (TEXT) - En sonda, en altta görünecek
        try {
            labelProp = componentSet.addComponentProperty("ButtonLabel", "TEXT", label || "Button");
            console.log("✅ ButtonLabel eklendi");
        } catch (e) {
            console.log("⚠️ ButtonLabel eklenemedi:", e.message);
        }

        // Her variant içindeki elementleri property'lere bağla
        for (var i = 0; i < componentSet.children.length; i++) {
            var variant = componentSet.children[i];
            if (variant.type === "COMPONENT") {

                // LeftIcon bul ve bağla
                if (showLeftProp || leftSwapProp) {
                    var leftIcon = variant.findOne(function (n) {
                        return n.name === "LeftIcon" && n.type === "INSTANCE";
                    });
                    if (leftIcon) {
                        var leftRefs = {};
                        if (showLeftProp) leftRefs.visible = showLeftProp;
                        if (leftSwapProp) leftRefs.mainComponent = leftSwapProp;

                        try {
                            if (Object.keys(leftRefs).length > 0) {
                                leftIcon.componentPropertyReferences = leftRefs;
                            }
                        } catch (e) {
                            console.log("LeftIcon ref hatası:", e.message);
                        }
                    }
                }

                // RightIcon bul ve bağla
                if (showRightProp || rightSwapProp) {
                    var rightIcon = variant.findOne(function (n) {
                        return n.name === "RightIcon" && n.type === "INSTANCE";
                    });
                    if (rightIcon) {
                        var rightRefs = {};
                        if (showRightProp) rightRefs.visible = showRightProp;
                        if (rightSwapProp) rightRefs.mainComponent = rightSwapProp;

                        try {
                            if (Object.keys(rightRefs).length > 0) {
                                rightIcon.componentPropertyReferences = rightRefs;
                            }
                        } catch (e) {
                            console.log("RightIcon ref hatası:", e.message);
                        }
                    }
                }

                // Label text node'unu bul ve TEXT property'ye bağla
                // Loading state'inde bu bağlamayı YAPMA, böylece "Loading..." yazısı sabit kalır
                var isLoadingState = variant.name.toLowerCase().indexOf("state=loading") !== -1;

                if (labelProp && !isLoadingState) {
                    var labelNode = variant.findOne(function (n) {
                        return n.name === "Label" && n.type === "TEXT";
                    });
                    if (labelNode) {
                        try {
                            labelNode.componentPropertyReferences = {
                                characters: labelProp
                            };
                        } catch (e) {
                            console.log("Label ref hatası:", e.message);
                        }
                    }
                }
            }
        }

        console.log("✅ Component properties kurulumu tamamlandı");
        figma.notify("✅ Tüm component property'ler eklendi!");

    } catch (e) {
        console.log("❌ Component property hatası:", e.message);
        figma.notify("⚠️ Property ekleme hatası: " + e.message, { error: true });
    }
}

// LOAD FONTS
function loadFonts() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, figma.loadFontAsync({ family: "Inter", style: "Regular" })];
                case 1: _a.sent(); return [4, figma.loadFontAsync({ family: "Inter", style: "Medium" })];
                case 2: _a.sent(); return [4, figma.loadFontAsync({ family: "Inter", style: "Semi Bold" })];
                case 3: _a.sent(); return [4, figma.loadFontAsync({ family: "Inter", style: "Bold" })];
                case 4: _a.sent(); return [2];
            }
        });
    });
}

var __awaiter = function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

var __generator = function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

// MAIN PLUGIN
figma.showUI(__html__, { width: 1440, height: 800 });

// Selection Change Listener - Component Set veya Instance seçildiğinde UI'a bilgi gönder
figma.on('selectionchange', function () {
    handleSelectionChange();
});

function handleSelectionChange() {
    return __awaiter(this, void 0, void 0, function () {
        var selection, selectedNode, componentSet, mainComp, variantProps, children, sampleName, parts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    selection = figma.currentPage.selection;
                    if (selection.length === 0) return [2];

                    selectedNode = selection[0];
                    componentSet = null;

                    // Component Set bul
                    if (selectedNode.type === 'COMPONENT_SET') {
                        componentSet = selectedNode;
                    } else if (selectedNode.type === 'COMPONENT' && selectedNode.parent && selectedNode.parent.type === 'COMPONENT_SET') {
                        componentSet = selectedNode.parent;
                    } else if (selectedNode.type === 'INSTANCE') {
                        return [4, selectedNode.getMainComponentAsync()];
                    }
                    return [3, 2];
                case 1:
                    mainComp = _a.sent();
                    if (mainComp && mainComp.parent && mainComp.parent.type === 'COMPONENT_SET') {
                        componentSet = mainComp.parent;
                    }
                    return [3, 2];
                case 2:
                    if (!componentSet) return [2];

                    // Component Set'in variant property'lerini oku
                    variantProps = {};
                    children = componentSet.children;

                    if (children.length > 0) {
                        sampleName = children[0].name;
                        parts = sampleName.split(', ');
                        parts.forEach(function (part) {
                            var keyVal = part.split('=');
                            if (keyVal.length === 2) {
                                var key = keyVal[0].trim();
                                if (!variantProps[key]) {
                                    variantProps[key] = [];
                                }
                            }
                        });

                        children.forEach(function (child) {
                            if (child.type === 'COMPONENT') {
                                var nameParts = child.name.split(', ');
                                nameParts.forEach(function (part) {
                                    var keyVal = part.split('=');
                                    if (keyVal.length === 2) {
                                        var key = keyVal[0].trim();
                                        var value = keyVal[1].trim();
                                        if (variantProps[key] && variantProps[key].indexOf(value) === -1) {
                                            variantProps[key].push(value);
                                        }
                                    }
                                });
                            }
                        });
                    }

                    figma.ui.postMessage({
                        type: 'component-set-selected',
                        data: {
                            name: componentSet.name,
                            componentCount: children.length,
                            variantProperties: variantProps
                        }
                    });
                    return [2];
            }
        });
    });
}

figma.ui.onmessage = function (msg) {
    return __awaiter(this, void 0, void 0, function () {
        var hierarchies, variants, sizes, states, colors, label, components, x, y, spacingX, spacingY, rowMaxHeight, h, hierarchy, color, colorStates, v, variant, s, size, sizeConfig, st, state, buttonComponent, iconOnlyComponent, componentSet, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(msg.type === 'generate-components')) return [3, 3];
                    _a.trys.push([0, 2, , 3]);
                    return [4, loadFonts()];
                case 1:
                    _a.sent();

                    var v1Spacing = msg.data.v1Spacing || { rowGap: 24, colGap: 40, variantGap: 32, sectionGap: 40 };
                    var v2Spacing = msg.data.v2Spacing || { rowGap: 32, colGap: 40, variantGap: 50, sectionGap: 60, colWidth: 160 };
                    var layoutStyling = {
                        labelFontSize: 13,
                        labelColor: '#111111',
                        variantFontSize: 13,
                        variantColor: '#111111',
                        sectionFontSize: 24,
                        sectionColor: '#000000'
                    };

                    // Process colors to RGB
                    var labelColorRgb = typeof layoutStyling.labelColor === 'string' ? hexToRgb(layoutStyling.labelColor) : layoutStyling.labelColor;
                    var variantColorRgb = typeof layoutStyling.variantColor === 'string' ? hexToRgb(layoutStyling.variantColor) : layoutStyling.variantColor;
                    var sectionColorRgb = typeof layoutStyling.sectionColor === 'string' ? hexToRgb(layoutStyling.sectionColor) : layoutStyling.sectionColor;

                    var layoutConfig = {
                        v2: {
                            colWidth: v2Spacing.colWidth,
                            colGap: v2Spacing.colGap,
                            rowGap: v2Spacing.rowGap,
                            variantGap: v2Spacing.variantGap,
                            sectionGap: v2Spacing.sectionGap
                        },
                        v1: {
                            colWidth: 180,
                            rowGap: v1Spacing.rowGap,
                            colGap: v1Spacing.colGap,
                            variantGap: v1Spacing.variantGap,
                            sectionGap: v1Spacing.sectionGap,
                            labelWidth: 80
                        }
                    };

                    hierarchies = msg.data.hierarchies;
                    variants = msg.data.variants;
                    sizes = msg.data.sizes;
                    states = msg.data.states;
                    colors = msg.data.colors;
                    label = msg.data.label || 'Button'; // Default fallback
                    console.log('📝 Received label from UI:', label, 'Full msg.data:', JSON.stringify(msg.data));

                    // UI'dan gelen ek veriler
                    var radiusValues = msg.data.radiusValues || [8];
                    var icons = msg.data.icons || { left: false, right: false, iconOnly: false };
                    var colorOverrides = msg.data.colorOverrides || {};
                    var selectedRadius = radiusValues.length > 0 ? radiusValues[0] : 8;

                    // Master Icon Kontrolü: Eğer hiç ikon yoksa oluşturma
                    var hasAnyIcon = icons.left || icons.right || icons.iconOnly;
                    var masterIconComponent = null;

                    if (hasAnyIcon) {
                        masterIconComponent = createMasterIconComponent();
                        masterIconComponent.x = 0;
                        masterIconComponent.y = 0;
                    }

                    // Loading state için Master Spinner Component
                    var hasLoadingState = states.indexOf('loading') !== -1;
                    var masterSpinnerComp = null;

                    if (hasLoadingState) {
                        masterSpinnerComp = createMasterSpinnerComponent();
                        masterSpinnerComp.x = 0;
                        masterSpinnerComp.y = hasAnyIcon ? 40 : 0;
                    }

                    console.log("📦 UI'dan gelen veriler:", {
                        colors: colors,
                        radiusValues: radiusValues,
                        selectedRadius: selectedRadius,
                        icons: icons
                    });

                    // UI'dan gelen layout versiyonu

                    var layoutVersion = msg.data.layoutVersion || 'v1';
                    var shadowsData = msg.data.shadows || { none: true, xs: false, sm: false };
                    var shadowOptions = [];
                    // Always add valid options if selected
                    if (shadowsData.none) shadowOptions.push('none');
                    if (shadowsData.xs) shadowOptions.push('xs');
                    if (shadowsData.sm) shadowOptions.push('sm');

                    // Fallback if user unchecks everything (defaults to none)
                    if (shadowOptions.length === 0) {
                        shadowOptions = ['none'];
                    }


                    components = [];

                    if (layoutVersion === 'v2') {
                        // ========================================
                        // V2 DOCUMENTATION LAYOUT (Showcase View)
                        // Matches ui.html logic: Radius Top -> Hierarchy -> Variant -> Table (Size=Row, State=Col)
                        // ========================================

                        var V2_SECTION_GAP = layoutConfig.v2.sectionGap;
                        var V2_VARIANT_GAP = layoutConfig.v2.variantGap;
                        var V2_ROW_GAP = layoutConfig.v2.rowGap;
                        var V2_COL_GAP = layoutConfig.v2.colGap;

                        var startX = 100;
                        var currentY = 100;
                        var labels = [];

                        // Documentation Title
                        var docTitle = figma.createText();
                        docTitle.characters = "Button Documentation";
                        docTitle.fontSize = layoutStyling.sectionFontSize;
                        docTitle.fontName = { family: "Inter", style: "Bold" };
                        docTitle.fills = [{ type: 'SOLID', color: sectionColorRgb }];
                        docTitle.x = startX;
                        docTitle.y = currentY;
                        labels.push(docTitle);
                        currentY += 80;

                        // --- 1. RADIUS PREVIEW SECTION (Top) ---
                        // Only shown if multiple radius values selected (otherwise redundant)
                        if (radiusValues.length > 1) {
                            var rSectionTitle = figma.createText();
                            rSectionTitle.characters = "Border Radius Options";
                            rSectionTitle.fontSize = 20;
                            rSectionTitle.fontName = { family: "Inter", style: "Semi Bold" };
                            rSectionTitle.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
                            rSectionTitle.x = startX;
                            rSectionTitle.y = currentY;
                            labels.push(rSectionTitle);
                            currentY += 40;

                            var rX = startX;
                            // Use Primary color for demo (first available or blue)
                            var demoHierarchy = hierarchies.length > 0 ? hierarchies[0] : 'primary';
                            var demoColor = colors[demoHierarchy] || '#3B82F6';
                            var demoColorStates = generateColorStates(demoColor);
                            var demoSize = 'md';

                            for (var ri = 0; ri < radiusValues.length; ri++) {
                                var rv = radiusValues[ri];

                                // Label
                                var rvLabel = figma.createText();
                                rvLabel.characters = (rv === 9999 ? "Pill" : rv + "px");
                                rvLabel.fontSize = 12;
                                rvLabel.fontName = { family: "Inter", style: "Medium" };
                                rvLabel.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                                rvLabel.textAlignHorizontal = "CENTER";
                                rvLabel.x = rX;
                                rvLabel.y = currentY;

                                // Create temp button to measure width for center alignment of label
                                // Just simple approximation: place label, then buttons below
                                labels.push(rvLabel);

                                var rBtnY = currentY + 24;

                                // Sample Button (Solid) - NOT added to components, just for visual demo
                                var rBtn = createButtonVariant({
                                    hierarchy: demoHierarchy,
                                    variant: 'solid',
                                    size: demoSize,
                                    state: 'default',
                                    iconOnly: false,
                                    label: "Button",
                                    color: demoColor,
                                    colorStates: demoColorStates,
                                    radius: rv,
                                    showLeftIcon: false,
                                    showRightIcon: false,
                                    includeIconOnly: false,
                                    includeRadius: true // Distinct variant
                                }, null); // No icon for radius demo usually, or generic

                                rBtn.x = rX;
                                rBtn.y = rBtnY;
                                // FIXED: Add to labels instead of components to avoid duplicate variants
                                labels.push(rBtn);

                                // Sample IconOnly
                                if (icons.iconOnly) {
                                    var rIconBtn = createButtonVariant({
                                        hierarchy: demoHierarchy,
                                        variant: 'solid',
                                        size: demoSize,
                                        state: 'default',
                                        iconOnly: true,
                                        label: "",
                                        color: demoColor,
                                        colorStates: demoColorStates,
                                        radius: rv,
                                        showLeftIcon: true,
                                        includeIconOnly: true,
                                        includeRadius: true
                                    }, masterIconComponent);

                                    rIconBtn.x = rX + rBtn.width + 12;
                                    rIconBtn.y = rBtnY;
                                    // FIXED: Add to labels instead of components to avoid duplicate variants
                                    labels.push(rIconBtn);
                                }

                                // Align label center to group
                                var groupW = rBtn.width;
                                if (icons.iconOnly && typeof rIconBtn !== 'undefined') {
                                    groupW = (rIconBtn.x + rIconBtn.width) - rBtn.x;
                                }

                                rvLabel.x = rX + (groupW / 2) - (rvLabel.width / 2); // Center simplified
                                // Actually Figma text 'x' is left by default.
                                rvLabel.x = rX; // Reset to left
                                // Let's just align left for simplicity or use center layout if complex

                                rX += groupW + 40;
                            }
                            currentY += 100; // Gap after radius section
                        }

                        // Active Radius for Main Table
                        var activeRadius = (radiusValues.length > 0) ? radiusValues[0] : 8;

                        // Increase Gap before Main Table starts to avoid Radius Overlap
                        currentY += 80;

                        // Layout Constants - Dynamic based on content
                        var STATE_LABEL_W = 140; // Row Header Width
                        // Dynamic column width based on icons and label
                        var COL_W = layoutConfig.v2.colWidth;
                        if (icons.left) COL_W += 30;
                        if (icons.right) COL_W += 30;

                        // Dynamic label width calculation - more accurate for long labels
                        var labelText = label || 'Button';
                        var estimatedLabelWidth = labelText.length * 9 + 120; // ~9px per char + padding + gap
                        if (estimatedLabelWidth > COL_W) COL_W = estimatedLabelWidth;

                        // Separate smaller width for icon-only columns (no text, just icon)
                        var ICON_COL_W = 80;

                        var ROW_H_BUFFER = 40;
                        var TABLE_START_X = startX;

                        // --- 2. HIERARCHY LOOP ---
                        for (var h = 0; h < hierarchies.length; h++) {
                            var hierarchy = hierarchies[h];
                            var color = colors[hierarchy] || '#3B82F6';
                            var colorStates = generateColorStates(color);
                            var hColorRgb = hexToRgb(color);

                            // Hierarchy Header (Group)
                            var dot = figma.createEllipse();
                            dot.resize(16, 16);
                            dot.fills = [{ type: 'SOLID', color: hColorRgb }];
                            dot.x = startX;
                            dot.y = currentY + 6;
                            labels.push(dot);

                            var hText = figma.createText();
                            hText.characters = hierarchy.charAt(0).toUpperCase() + hierarchy.slice(1);
                            hText.fontSize = layoutStyling.sectionFontSize;
                            hText.fontName = { family: "Inter", style: "Bold" };
                            hText.fills = [{ type: 'SOLID', color: sectionColorRgb }];
                            hText.x = startX + 24;
                            hText.y = currentY;
                            labels.push(hText);

                            var hBadge = figma.createText();
                            hBadge.characters = color.toUpperCase();
                            hBadge.fontSize = 14;
                            hBadge.fontName = { family: "Inter", style: "Medium" };
                            hBadge.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                            hBadge.x = hText.x + hText.width + 16;
                            hBadge.y = currentY + 6;
                            labels.push(hBadge);

                            currentY += 60;

                            // --- 3. VARIANT LOOP ---
                            for (var v = 0; v < variants.length; v++) {
                                var variant = variants[v];

                                // Variant Sub-Header
                                var vText = figma.createText();
                                vText.characters = variant.toUpperCase();
                                vText.fontSize = layoutStyling.variantFontSize;
                                vText.fontName = { family: "Inter", style: "Bold" };
                                vText.fills = [{ type: 'SOLID', color: variantColorRgb }];
                                vText.x = TABLE_START_X;
                                vText.y = currentY;
                                labels.push(vText);
                                currentY += 50; // Gap before table Headers

                                // --- TABLE HEADERS (Top: SIZES) ---
                                var headerY = currentY;
                                var headerX = TABLE_START_X + STATE_LABEL_W + V2_COL_GAP;

                                // 1. Size Headers (Manual Text Placement to avoid Frame Labels)
                                for (var s = 0; s < sizes.length; s++) {
                                    var sizeName = sizes[s];
                                    var sizeConfig = SIZE_CONFIG[sizeName];

                                    // Size Name (Matching UI: 11px, Semi Bold, #64748B)
                                    var szLabel = figma.createText();
                                    szLabel.characters = sizeName.toUpperCase();
                                    szLabel.fontSize = layoutStyling.labelFontSize;
                                    szLabel.fontName = { family: "Inter", style: "Semi Bold" };
                                    szLabel.fills = [{ type: 'SOLID', color: labelColorRgb }];
                                    szLabel.textAlignHorizontal = "CENTER";
                                    szLabel.resize(COL_W, 14);
                                    szLabel.x = headerX;
                                    szLabel.y = headerY;
                                    labels.push(szLabel);

                                    // Size Detail (Matching UI: 9px, Regular, #94A3B8)
                                    var szDetail = figma.createText();
                                    szDetail.characters = sizeConfig.height + "px";
                                    szDetail.fontSize = 9;
                                    szDetail.fontName = { family: "Inter", style: "Regular" };
                                    szDetail.fills = [{ type: 'SOLID', color: { r: 0.58, g: 0.64, b: 0.72 } }];
                                    szDetail.textAlignHorizontal = "CENTER";
                                    szDetail.resize(COL_W, 12);
                                    szDetail.x = headerX;
                                    szDetail.y = headerY + 14;
                                    labels.push(szDetail);

                                    headerX += COL_W + V2_COL_GAP;
                                }

                                // 2. Icon Only Header
                                if (icons.iconOnly) {
                                    // Separator or spacing
                                    headerX += 20;

                                    for (var s = 0; s < sizes.length; s++) {
                                        var sizeName = sizes[s];
                                        var sizeConfig = SIZE_CONFIG[sizeName];

                                        // Icon Only Header Label
                                        var ioLabel = figma.createText();
                                        ioLabel.characters = sizeName.toUpperCase(); // + " ICON";
                                        ioLabel.fontSize = layoutStyling.labelFontSize;
                                        ioLabel.fontName = { family: "Inter", style: "Semi Bold" };
                                        ioLabel.fills = [{ type: 'SOLID', color: labelColorRgb }];
                                        ioLabel.textAlignHorizontal = "CENTER";
                                        ioLabel.resize(ICON_COL_W, 14);
                                        ioLabel.x = headerX;
                                        ioLabel.y = headerY;
                                        labels.push(ioLabel);

                                        // Detail
                                        var ioDetail = figma.createText();
                                        ioDetail.characters = sizeConfig.height + "px";
                                        ioDetail.fontSize = 9;
                                        ioDetail.fontName = { family: "Inter", style: "Regular" };
                                        ioDetail.fills = [{ type: 'SOLID', color: { r: 0.58, g: 0.64, b: 0.72 } }];
                                        ioDetail.textAlignHorizontal = "CENTER";
                                        ioDetail.resize(ICON_COL_W, 12);
                                        ioDetail.x = headerX;
                                        ioDetail.y = headerY + 14;
                                        labels.push(ioDetail);

                                        headerX += ICON_COL_W + V2_COL_GAP;
                                    }
                                }
                                currentY += 60; // Space after Size Headers

                                // --- 4. STATES LOOP (Rows) ---
                                for (var st = 0; st < states.length; st++) {
                                    var state = states[st];

                                    // Calc Max Height in this row to center items vertically
                                    var maxSize = sizes.includes('lg') ? 'lg' : (sizes.includes('md') ? 'md' : sizes[0]);
                                    var maxH = SIZE_CONFIG[maxSize].height;
                                    var rowH = (maxH + 16) * shadowOptions.length + ROW_H_BUFFER;

                                    // Row Label (Left Col: State Name) - Text only
                                    var stText = figma.createText();
                                    stText.characters = state.toUpperCase();
                                    stText.fontSize = layoutStyling.labelFontSize;
                                    stText.fontName = { family: "Inter", style: "Bold" };
                                    stText.fills = [{ type: 'SOLID', color: labelColorRgb }];
                                    stText.x = TABLE_START_X;
                                    // Vertically align label to row center
                                    stText.y = currentY + (rowH - 14) / 2; // approx center cap height
                                    labels.push(stText);

                                    // --- SIZES LOOP (Columns) ---
                                    var btnX = TABLE_START_X + STATE_LABEL_W + V2_COL_GAP;

                                    for (var s = 0; s < sizes.length; s++) {
                                        var size = sizes[s];
                                        var overrideKey = hierarchy + '-' + variant + '-' + state;

                                        for (var sh = 0; sh < shadowOptions.length; sh++) {
                                            var shadowVal = shadowOptions[sh];

                                            var buttonComponent = createButtonVariant({
                                                override: colorOverrides[overrideKey] || null,
                                                hierarchy: hierarchy,
                                                variant: variant,
                                                size: size,
                                                state: state,
                                                iconOnly: false,
                                                label: label,
                                                color: color,
                                                colorStates: colorStates,
                                                radius: activeRadius,
                                                showLeftIcon: icons.left,
                                                showRightIcon: icons.right,
                                                includeIconOnly: icons.iconOnly,
                                                includeRadius: radiusValues.length > 1,
                                                masterSpinner: masterSpinnerComp,
                                                shadow: shadowVal
                                            }, masterIconComponent);

                                            // Center in Cell & Stack Vertically
                                            var itemH = buttonComponent.height + 16;
                                            var totalStackH = itemH * shadowOptions.length; // Approximate
                                            var startY = currentY + (rowH - totalStackH) / 2 + 8;

                                            buttonComponent.x = btnX + (COL_W - buttonComponent.width) / 2;
                                            buttonComponent.y = startY + (sh * itemH);

                                            components.push(buttonComponent);
                                        }
                                        btnX += COL_W + V2_COL_GAP;
                                    }

                                    // Icon Only Column
                                    if (icons.iconOnly) {
                                        // Add spacing/separator gap
                                        btnX += 20;

                                        for (var s = 0; s < sizes.length; s++) {
                                            var size = sizes[s];
                                            var overrideKey = hierarchy + '-' + variant + '-' + state;

                                            for (var sh = 0; sh < shadowOptions.length; sh++) {
                                                var shadowVal = shadowOptions[sh];

                                                var iconOnlyComponent = createButtonVariant({
                                                    override: colorOverrides[overrideKey] || null,
                                                    hierarchy: hierarchy,
                                                    variant: variant,
                                                    size: size,
                                                    state: state,
                                                    iconOnly: true,
                                                    label: label,
                                                    color: color,
                                                    colorStates: colorStates,
                                                    radius: activeRadius,
                                                    showLeftIcon: true,
                                                    includeIconOnly: true,
                                                    includeRadius: radiusValues.length > 1,
                                                    masterSpinner: masterSpinnerComp,
                                                    shadow: shadowVal
                                                }, masterIconComponent);

                                                // Stack positioning
                                                var itemH = iconOnlyComponent.height + 16;
                                                var totalStackH = itemH * shadowOptions.length;
                                                var startY = currentY + (rowH - totalStackH) / 2 + 8;

                                                iconOnlyComponent.x = btnX + (ICON_COL_W - iconOnlyComponent.width) / 2;
                                                iconOnlyComponent.y = startY + (sh * itemH);
                                                components.push(iconOnlyComponent);
                                            }

                                            btnX += ICON_COL_W + V2_COL_GAP;
                                        }
                                    }

                                    currentY += rowH + V2_ROW_GAP;
                                }
                                currentY += V2_VARIANT_GAP;
                            }
                            currentY += V2_SECTION_GAP;
                        }

                        // FRAME & COMBINE (V2)
                        if (components.length > 0) {
                            figma.currentPage.selection = [];

                            var componentSet = figma.combineAsVariants(components, figma.currentPage);
                            componentSet.name = "Button Documentation (V2)";

                            // Hide Component Set Background so it doesn't overlap the white frame
                            componentSet.fills = [];
                            componentSet.clipsContent = false;

                            addComponentProperties(componentSet, masterIconComponent, icons, label);

                            // Create Documentation Frame (White Background)
                            var docsFrame = figma.createFrame();
                            docsFrame.name = "Button Documentation (V2)";
                            docsFrame.layoutMode = "NONE";
                            docsFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // Pure White

                            // Styling: Pure White Frame - No Border
                            docsFrame.cornerRadius = 32;
                            docsFrame.strokes = []; // No Border
                            docsFrame.paddingLeft = 60;
                            docsFrame.paddingBottom = 60;

                            // FINAL ASSEMBLY V1 - "GRUP VE KUTU"

                            // 1. Tüm içeriği bir grup yap
                            var contentGroup = figma.group([...labels, componentSet], figma.currentPage);
                            contentGroup.name = "Content";

                            // 2. Grubu Frame içine al
                            docsFrame.appendChild(contentGroup);

                            // 3. Grubu Frame içinde hizala
                            contentGroup.x = 60;
                            contentGroup.y = 60;

                            // 4. Frame'i grubun boyutuna göre resize et
                            docsFrame.resize(
                                contentGroup.width + 120, // Padding x 2
                                contentGroup.height + 120
                            );

                            // 5. Görsel Düzenlemeler
                            componentSet.fills = [];
                            componentSet.clipsContent = false;
                            docsFrame.clipsContent = false;

                            docsFrame.x = 100; docsFrame.y = 100;

                            // === MASTER COMPONENTS SECTION ===
                            if (masterIconComponent || masterSpinnerComp) {
                                var masterSection = figma.createFrame();
                                masterSection.name = "Master Components";
                                masterSection.layoutMode = "VERTICAL";
                                masterSection.primaryAxisSizingMode = "AUTO";
                                masterSection.counterAxisSizingMode = "AUTO";
                                masterSection.itemSpacing = 16;
                                masterSection.paddingTop = 24;
                                masterSection.paddingBottom = 24;
                                masterSection.paddingLeft = 24;
                                masterSection.paddingRight = 24;
                                masterSection.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
                                masterSection.cornerRadius = 16;
                                masterSection.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
                                masterSection.strokeWeight = 1;

                                // Section Title
                                var masterTitle = figma.createText();
                                masterTitle.characters = "🔧 Master Components";
                                masterTitle.fontSize = 14;
                                masterTitle.fontName = { family: "Inter", style: "Semi Bold" };
                                masterTitle.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
                                masterSection.appendChild(masterTitle);

                                // Subtitle
                                var masterSubtitle = figma.createText();
                                masterSubtitle.characters = "Swap these to customize icons globally";
                                masterSubtitle.fontSize = 11;
                                masterSubtitle.fontName = { family: "Inter", style: "Regular" };
                                masterSubtitle.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                                masterSection.appendChild(masterSubtitle);

                                // Icons Row
                                var iconsRow = figma.createFrame();
                                iconsRow.name = "Icons";
                                iconsRow.layoutMode = "HORIZONTAL";
                                iconsRow.primaryAxisSizingMode = "AUTO";
                                iconsRow.counterAxisSizingMode = "AUTO";
                                iconsRow.itemSpacing = 24;
                                iconsRow.fills = [];

                                if (masterIconComponent) {
                                    masterIconComponent.x = 0;
                                    masterIconComponent.y = 0;
                                    iconsRow.appendChild(masterIconComponent);
                                }
                                if (masterSpinnerComp) {
                                    masterSpinnerComp.x = 0;
                                    masterSpinnerComp.y = 0;
                                    iconsRow.appendChild(masterSpinnerComp);
                                }

                                masterSection.appendChild(iconsRow);

                                // Position master section ABOVE docsFrame
                                masterSection.x = docsFrame.x;
                                masterSection.y = docsFrame.y;

                                // Shift docsFrame down below masterSection
                                docsFrame.y = masterSection.y + masterSection.height + 40;
                            }

                            figma.viewport.scrollAndZoomIntoView([docsFrame]);
                            figma.ui.postMessage({ type: 'generation-complete', count: components.length });
                            components = [];
                        }
                    } else {
                        // ========================================
                        // V1 COMPACT LAYOUT - HORIZONTAL (Size = Row, State = Col)
                        // Kullanıcı isteği: Plugin arayüzü ile birebir aynı düzen.
                        // Sol: Size Label (SM, MD..). Sağa doğru: Default, Hover, Pressed...
                        // ========================================

                        var V1_SECTION_GAP = layoutConfig.v1.sectionGap;
                        var V1_VARIANT_GAP = layoutConfig.v1.variantGap;
                        var V1_ROW_GAP = layoutConfig.v1.rowGap;
                        var V1_COL_GAP = layoutConfig.v1.colGap;
                        var V1_LABEL_WIDTH = layoutConfig.v1.labelWidth || 80;

                        var startX = 100;
                        var currentY = 100;
                        var labels = [];
                        var maxLayoutWidth = 0; // Track max width for frame resizing

                        var mainTitle = figma.createText();
                        mainTitle.characters = "Compact View";
                        mainTitle.fontSize = layoutStyling.sectionFontSize;
                        mainTitle.fontName = { family: "Inter", style: "Bold" };
                        mainTitle.fills = [{ type: 'SOLID', color: sectionColorRgb }];
                        mainTitle.x = startX;
                        mainTitle.y = currentY;
                        labels.push(mainTitle);
                        currentY += 60;

                        // Radius loop - V2 logic
                        var radiusLoop = radiusValues.length > 0 ? radiusValues : [8];
                        var includeRadius = radiusValues.length > 1;

                        // =============================================
                        // EXCEL-LIKE GRID SYSTEM
                        // Calculate ALL column positions ONCE upfront
                        // =============================================

                        var FIXED_COL_W = layoutConfig.v1.colWidth; // Base column width
                        if (icons.left) FIXED_COL_W += 40;
                        if (icons.right) FIXED_COL_W += 40;
                        if (icons.iconOnly) FIXED_COL_W += 90;
                        if (states.indexOf('loading') !== -1) FIXED_COL_W += 50;

                        // Dynamic label width calculation - more accurate for long labels
                        var labelText = label || 'Button';
                        var estimatedLabelWidth = labelText.length * 9 + 120; // ~9px per char + padding + gap
                        if (estimatedLabelWidth > FIXED_COL_W) FIXED_COL_W = estimatedLabelWidth;

                        // Pre-calculate column X positions (like Excel columns A, B, C...)
                        var GRID_START_X = startX + V1_LABEL_WIDTH + V1_COL_GAP;
                        var COL_POSITIONS = [];
                        for (var ci = 0; ci < states.length; ci++) {
                            COL_POSITIONS.push(GRID_START_X + (ci * (FIXED_COL_W + V1_COL_GAP)));
                        }

                        for (var h = 0; h < hierarchies.length; h++) {
                            var hierarchy = hierarchies[h];
                            var color = colors[hierarchy] || '#3B82F6';
                            var colorStates = generateColorStates(color);
                            var hColorRgb = hexToRgb(color);

                            // Hierarchy Header (Dot + Text) - V2 Style
                            var hDot = figma.createEllipse();
                            hDot.resize(16, 16);
                            hDot.fills = [{ type: 'SOLID', color: hColorRgb }];
                            hDot.x = startX;
                            hDot.y = currentY + 6;
                            labels.push(hDot);

                            var hTitle = figma.createText();
                            hTitle.characters = hierarchy.charAt(0).toUpperCase() + hierarchy.slice(1);
                            hTitle.fontSize = layoutStyling.sectionFontSize;
                            hTitle.fontName = { family: "Inter", style: "Bold" };
                            hTitle.fills = [{ type: 'SOLID', color: sectionColorRgb }];
                            hTitle.x = startX + 24;
                            hTitle.y = currentY;
                            labels.push(hTitle);

                            // Color Badge matches V2
                            var hBadge = figma.createText();
                            hBadge.characters = color.toUpperCase();
                            hBadge.fontSize = 14;
                            hBadge.fontName = { family: "Inter", style: "Medium" };
                            hBadge.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                            hBadge.x = hTitle.x + hTitle.width + 16;
                            hBadge.y = currentY + 6;
                            labels.push(hBadge);
                            currentY += V1_SECTION_GAP;

                            for (var v = 0; v < variants.length; v++) {
                                var variant = variants[v];

                                // Variant Header
                                var vTitle = figma.createText();
                                vTitle.characters = variant.toUpperCase();
                                vTitle.fontSize = layoutStyling.variantFontSize;
                                vTitle.fontName = { family: "Inter", style: "Semi Bold" };
                                vTitle.fills = [{ type: 'SOLID', color: variantColorRgb }];
                                vTitle.letterSpacing = { value: 0.05, unit: "PIXELS" };
                                vTitle.x = startX;
                                vTitle.y = currentY;
                                labels.push(vTitle);
                                currentY += 32;

                                // Radius loop
                                for (var r = 0; r < radiusLoop.length; r++) {
                                    var currentRadius = radiusLoop[r];

                                    if (includeRadius) {
                                        var rLabel = figma.createText();
                                        rLabel.characters = currentRadius === 9999 ? "Pill" : currentRadius + "px";
                                        rLabel.fontSize = 10;
                                        rLabel.fontName = { family: "Inter", style: "Medium" };
                                        rLabel.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
                                        rLabel.x = startX;
                                        rLabel.y = currentY;
                                        labels.push(rLabel);
                                        currentY += 20;
                                    }

                                    // --- STATE HEADERS (COLUMN LABELS) ---
                                    var headerY = currentY;

                                    for (var sth = 0; sth < states.length; sth++) {
                                        var stateName = states[sth];

                                        var stLabel = figma.createText();
                                        stLabel.characters = stateName.charAt(0).toUpperCase() + stateName.slice(1);
                                        stLabel.fontSize = layoutStyling.labelFontSize;
                                        stLabel.fontName = { family: "Inter", style: "Semi Bold" };
                                        stLabel.fills = [{ type: 'SOLID', color: labelColorRgb }];
                                        stLabel.textAlignHorizontal = "LEFT";

                                        // Use grid system - fixed width, exact column position
                                        stLabel.resize(FIXED_COL_W, 14);
                                        stLabel.x = COL_POSITIONS[sth]; // Exact grid position
                                        stLabel.y = headerY;
                                        labels.push(stLabel);
                                    }
                                    // Capture maximum width reached using grid
                                    maxLayoutWidth = Math.max(maxLayoutWidth, COL_POSITIONS[states.length - 1] + FIXED_COL_W);

                                    currentY += 24; // Header height

                                    // --- ROWS (SIZES) ---
                                    for (var s = 0; s < sizes.length; s++) {
                                        var size = sizes[s];
                                        var sizeConfig = SIZE_CONFIG[size];

                                        // Row Label (Size + PX)
                                        // Size Name (Matching UI: 13px, Semi Bold, #111111)
                                        var sLabel = figma.createText();
                                        sLabel.characters = size.toUpperCase();
                                        sLabel.fontSize = layoutStyling.labelFontSize;
                                        sLabel.fontName = { family: "Inter", style: "Semi Bold" };
                                        sLabel.fills = [{ type: 'SOLID', color: labelColorRgb }];
                                        sLabel.x = startX;
                                        // Vertically center logic: Group of (14+12) = 26px height approx
                                        var labelGroupH = 24;
                                        var labelStartY = currentY + (sizeConfig.height - labelGroupH) / 2;
                                        sLabel.y = labelStartY;
                                        labels.push(sLabel);

                                        // Size Detail (Matching UI: 9px, Regular, #94A3B8)
                                        var sDetail = figma.createText();
                                        sDetail.characters = sizeConfig.height + "px";
                                        sDetail.fontSize = 9;
                                        sDetail.fontName = { family: "Inter", style: "Regular" };
                                        sDetail.fills = [{ type: 'SOLID', color: { r: 0.58, g: 0.64, b: 0.72 } }];
                                        sDetail.x = startX;
                                        sDetail.y = labelStartY + 14;
                                        labels.push(sDetail);

                                        var rowMaxH = sizeConfig.height * shadowOptions.length + (16 * (shadowOptions.length - 1));

                                        // --- COLUMNS (STATES) - Using GRID positions ---
                                        for (var st = 0; st < states.length; st++) {
                                            var state = states[st];

                                            var overrideKey = hierarchy + '-' + variant + '-' + state;
                                            var overrideConfig = colorOverrides[overrideKey] || null;

                                            // Shadow Loop
                                            for (var sh = 0; sh < shadowOptions.length; sh++) {
                                                var shadowVal = shadowOptions[sh];

                                                var buttonComponent = createButtonVariant({
                                                    override: overrideConfig,
                                                    hierarchy: hierarchy,
                                                    variant: variant,
                                                    size: size,
                                                    state: state,
                                                    iconOnly: false,
                                                    label: label,
                                                    color: color,
                                                    colorStates: colorStates,
                                                    radius: currentRadius,
                                                    showLeftIcon: icons.left,
                                                    showRightIcon: icons.right,
                                                    includeIconOnly: icons.iconOnly,
                                                    includeRadius: includeRadius,
                                                    masterSpinner: masterSpinnerComp,
                                                    shadow: shadowVal
                                                }, masterIconComponent);

                                                var iconOnlyComponent = null;
                                                if (icons.iconOnly) {
                                                    iconOnlyComponent = createButtonVariant({
                                                        override: overrideConfig,
                                                        hierarchy: hierarchy,
                                                        variant: variant,
                                                        size: size,
                                                        state: state,
                                                        iconOnly: true,
                                                        label: label,
                                                        color: color,
                                                        colorStates: colorStates,
                                                        radius: currentRadius,
                                                        showLeftIcon: true,
                                                        showRightIcon: false,
                                                        includeIconOnly: true,
                                                        includeRadius: includeRadius,
                                                        masterSpinner: masterSpinnerComp,
                                                        shadow: shadowVal
                                                    }, masterIconComponent);
                                                }

                                                // SIMPLE LEFT-ALIGNED placement
                                                var cellX = COL_POSITIONS[st];
                                                var stackY = currentY + (sh * (sizeConfig.height + 16));

                                                // Main button at grid position
                                                buttonComponent.x = cellX;
                                                buttonComponent.y = stackY;
                                                components.push(buttonComponent);

                                                // IconOnly right after main button
                                                if (iconOnlyComponent) {
                                                    iconOnlyComponent.x = cellX + buttonComponent.width + 12;
                                                    iconOnlyComponent.y = stackY;
                                                    components.push(iconOnlyComponent);
                                                }
                                            }
                                        }
                                        currentY += rowMaxH + V1_ROW_GAP;
                                    }
                                }
                                currentY += V1_VARIANT_GAP;
                            }
                            currentY += V1_SECTION_GAP;
                        }

                        if (components.length > 0) {
                            figma.currentPage.selection = [];

                            var mainContentNode = null;
                            var isComponentSet = false;

                            try {
                                var componentSet = figma.combineAsVariants(components, figma.currentPage);
                                componentSet.name = "Button Documentation (V1)";
                                componentSet.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]; // Transparent
                                componentSet.clipsContent = false;

                                // Attempt to add Description/Link
                                try {
                                    addComponentProperties(componentSet, masterIconComponent, icons, label);
                                } catch (e) { console.error("Error adding component properties:", e); }

                                mainContentNode = componentSet;
                                isComponentSet = true;
                            } catch (e) {
                                console.error("V1 Variant Combination Failed:", e);
                                figma.notify("?? Grid created, but variants could not be combined (Name conflict likely).");

                                // Fallback: Group loose components so they don't float around
                                mainContentNode = figma.group(components, figma.currentPage);
                                mainContentNode.name = "Button Components (Group)";
                            }

                            // Create Documentation Frame (White Background)
                            var docsFrame = figma.createFrame();
                            docsFrame.name = "Button Documentation (V1)";
                            docsFrame.layoutMode = "NONE";
                            docsFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // Pure White

                            // Styling: Pure White Frame - No Border
                            docsFrame.cornerRadius = 32;
                            docsFrame.strokes = []; // No Border
                            docsFrame.paddingLeft = 60;
                            docsFrame.paddingBottom = 60;

                            // FINAL ASSEMBLY V1 - "GRUP VE KUTU"

                            // 1. T�m i�eri�i bir grup yap
                            // Only add mainContentNode if it was successfully created
                            var groupContents = [...labels];
                            if (mainContentNode) groupContents.push(mainContentNode);

                            var contentGroup = figma.group(groupContents, figma.currentPage);
                            contentGroup.name = "Content";

                            // 2. Grubu Frame i�ine al
                            docsFrame.appendChild(contentGroup);

                            // 3. Grubu Frame i�inde hizala
                            contentGroup.x = 60;
                            contentGroup.y = 60;

                            // 4. Frame'i grubun boyutuna g�re resize et
                            docsFrame.resize(
                                contentGroup.width + 120, // Padding x 2
                                contentGroup.height + 120
                            );

                            // 5. G�rsel D�zenlemeler
                            docsFrame.clipsContent = false;

                            docsFrame.x = 100;
                            docsFrame.y = 100;

                            // === MASTER COMPONENTS SECTION ===
                            if (masterIconComponent || masterSpinnerComp) {
                                var masterSection = figma.createFrame();
                                masterSection.name = "Master Components";
                                masterSection.layoutMode = "VERTICAL";
                                masterSection.primaryAxisSizingMode = "AUTO";
                                masterSection.counterAxisSizingMode = "AUTO";
                                masterSection.itemSpacing = 16;
                                masterSection.paddingTop = 24;
                                masterSection.paddingBottom = 24;
                                masterSection.paddingLeft = 24;
                                masterSection.paddingRight = 24;
                                masterSection.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
                                masterSection.cornerRadius = 16;
                                masterSection.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
                                masterSection.strokeWeight = 1;

                                // Section Title
                                var masterTitle = figma.createText();
                                masterTitle.characters = "🔧 Master Components";
                                masterTitle.fontSize = 14;
                                masterTitle.fontName = { family: "Inter", style: "Semi Bold" };
                                masterTitle.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
                                masterSection.appendChild(masterTitle);

                                // Subtitle
                                var masterSubtitle = figma.createText();
                                masterSubtitle.characters = "Swap these to customize icons globally";
                                masterSubtitle.fontSize = 11;
                                masterSubtitle.fontName = { family: "Inter", style: "Regular" };
                                masterSubtitle.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
                                masterSection.appendChild(masterSubtitle);

                                // Icons Row
                                var iconsRow = figma.createFrame();
                                iconsRow.name = "Icons";
                                iconsRow.layoutMode = "HORIZONTAL";
                                iconsRow.primaryAxisSizingMode = "AUTO";
                                iconsRow.counterAxisSizingMode = "AUTO";
                                iconsRow.itemSpacing = 24;
                                iconsRow.fills = [];

                                if (masterIconComponent) {
                                    masterIconComponent.x = 0;
                                    masterIconComponent.y = 0;
                                    iconsRow.appendChild(masterIconComponent);
                                }
                                if (masterSpinnerComp) {
                                    masterSpinnerComp.x = 0;
                                    masterSpinnerComp.y = 0;
                                    iconsRow.appendChild(masterSpinnerComp);
                                }

                                masterSection.appendChild(iconsRow);

                                // Position master section ABOVE docsFrame
                                masterSection.x = docsFrame.x;
                                masterSection.y = docsFrame.y;

                                // Shift docsFrame down below masterSection
                                docsFrame.y = masterSection.y + masterSection.height + 40;
                            }

                            figma.viewport.scrollAndZoomIntoView([docsFrame]);
                            figma.ui.postMessage({ type: 'generation-complete', count: components.length });

                            // Temizlik
                            components = [];
                        }
                    }
                    return [3, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error generating components:", error_1);
                    figma.ui.postMessage({
                        type: 'generation-error',
                        error: String(error_1)
                    });
                    return [3, 3];
                case 3:
                    if (msg.type === 'cancel') {
                        figma.closePlugin();
                        return [2];
                    }
                    return [2];
            }
        });
    });
};



/**
 * Hex to RGB for Figma
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0.2, g: 0.5, b: 0.9 };
}
