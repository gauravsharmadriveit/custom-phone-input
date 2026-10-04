# Custom Phone Input & Country Selector

A lightweight, responsive, and dependency-minimal international phone input widget and standalone country selector for the web. Built with HTML5, CSS3, and jQuery, featuring automatic GeoIP country detection, instant live search, Twemoji SVG flag icons, and per-country phone number length validation.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Implementations & Demos](#implementations--demos)
  - [1. Standalone Dynamic Widget (`index.html`)](#1-standalone-dynamic-widget-indexhtml)
  - [2. Modular Component (`index-2.html`)](#2-modular-component-index-2html)
  - [3. Dedicated Country Picker (`country-select.html`)](#3-dedicated-country-picker-country-selecthtml)
- [Data Schema (`countries.json`)](#data-schema-countriesjson)
- [Form Submission & Payloads](#form-submission--payloads)
- [How It Works (Technical Flow)](#how-it-works-technical-flow)
- [Customization Guide](#customization-guide)
  - [Changing the Default Fallback Country](#changing-the-default-fallback-country)
  - [Modifying or Disabling GeoIP Detection](#modifying-or-disabling-geoip-detection)
  - [Changing CDN Assets or Flag Providers](#changing-cdn-assets-or-flag-providers)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

---

## Overview

Modern web forms require a frictionless user experience when collecting international phone numbers. This project provides a ready-to-use solution that:
1. Detects the visitor's country automatically via IP geolocation.
2. Lets users quickly switch countries through a searchable dropdown with country flags and dial codes.
3. Automatically strips non-numeric input and restricts maximum character length based on local telephone regulations.
4. Validates number length (min/max digits) before submission.
5. Populates standard hidden inputs for seamless backend form integration.

---

## Key Features

- **🌐 240+ Countries Supported**: Comprehensive JSON dataset with official country names, ISO2 codes, dialing codes, and valid phone number length limits.
- **📍 Automatic GeoIP Lookup**: Automatically detects visitor's country using `ipinfo.io` JSONP lookup, defaulting gracefully to India (`+91` / `IN`) if blocked or unavailable.
- **🔎 Real-Time Search**: Instant filtering of countries by country name, dialing code (e.g. `+1`, `+44`), or 2-letter ISO code (e.g. `US`, `GB`).
- **🎨 High-Quality SVG Flags**: Integrated with Twitter Twemoji CDN for crisp, uniform flag display across all operating systems.
- **🛡️ Input Sanitization & Masking**: Disallows non-numeric characters and enforces country-specific maximum input length dynamically on keystroke.
- **✅ Per-Country Validation**: Validates phone number against exact country-specific minimum and maximum allowed lengths before form submission.
- **📦 Ready for Form Submission**: Populates hidden input fields (`country_name`, `country_code`, `country_iso`, `phone`, `full_phone`) for straightforward standard POST or AJAX submissions.
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile screens with touch-friendly dropdown lists.

---

## Project Structure

```text
custom-phone-input/
│
├── country-select.html       # Standalone country dropdown widget (enhances native <select>)
├── index.html                # Self-contained demo (dynamically injects widget into markup)
├── index-2.html              # Modular demo (uses external CSS & JS + Bootstrap card UI)
├── README.md                 # Complete project documentation
├── README.txt                # Legacy quick-start note
│
├── css/
│   └── style.css             # Main styling for phone input, dropdown, flags, and cards
│
├── data/
│   └── countries.json        # Country database (~240+ records with flags, dial codes, limits)
│
└── js/
    └── phone-input.js        # Core jQuery logic for index-2.html
```

---

## Getting Started & Local Setup

> [!IMPORTANT]
> Because country data is loaded dynamically via `$.getJSON("data/countries.json")`, opening files directly with the `file:///` protocol may trigger browser CORS restrictions. You must run the project through a local web server.

### Option 1: VS Code Live Server (Easiest)
1. Install the **Live Server** extension in VS Code (`ritwickdey.LiveServer`).
2. Right-click on `index.html`, `index-2.html`, or `country-select.html`.
3. Select **"Open with Live Server"**.

### Option 2: Python HTTP Server
Run one of the following commands in the project root directory:

```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000/index.html` in your web browser.

### Option 3: Node.js `serve` / `http-server`
```bash
npx serve .
# or
npx http-server -p 8000
```

### Option 4: PHP Built-in Server
```bash
php -S localhost:8000
```

---

## Implementations & Demos

The project includes three separate implementations tailored for different integration preferences:

### 1. Standalone Dynamic Widget (`index.html`)
- **Concept**: Minimalist DOM integration.
- **How it works**: You only write a simple `<input type="tel" id="phoneNumber">` inside a form. On document ready, jQuery wraps the input inside `.custom-phone`, generates the flag button, dropdown menu, search bar, and error message containers on the fly.
- **Best for**: Embedding into existing templates without altering your core HTML structure.

```html
<!-- Minimal HTML required in index.html -->
<form id="phoneForm" class="form-wrap" novalidate>
    <label for="phoneNumber">Mobile number</label>

    <input type="tel" id="phoneNumber" class="phone-number"
           placeholder="Enter mobile number" autocomplete="tel" inputmode="numeric">

    <!-- Hidden fields populated by JS -->
    <input type="hidden" id="countryName" name="country_name">
    <input type="hidden" id="countryCode" name="country_code">
    <input type="hidden" id="countryIso"  name="country_iso">
    <input type="hidden" id="hiddenPhone" name="phone">
    <input type="hidden" id="fullPhone"   name="full_phone">

    <button type="submit" class="submit-btn">Submit</button>
</form>
```

---

### 2. Modular Component (`index-2.html`)
- **Concept**: Decoupled HTML, CSS, and JS architecture.
- **Assets**: Uses `css/style.css`, `js/phone-input.js`, Bootstrap 5 CSS, and Bootstrap Icons.
- **How it works**: Pre-defined widget DOM structure inside an attractive card layout.
- **Best for**: Production web applications where styles and scripts are managed as separate asset files.

```html
<!-- Link assets in <head> -->
<link rel="stylesheet" href="css/style.css">

<!-- Load scripts before </body> -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="js/phone-input.js"></script>
```

---

### 3. Dedicated Country Picker (`country-select.html`)
- **Concept**: Standalone country dropdown selector without the phone number field.
- **How it works**: Progressively enhances a standard HTML `<select id="countrySelect">`. It hides the native select, populates `<option>` elements, and renders a custom dropdown menu complete with search and SVG flags.
- **Best for**: Registration forms, billing address forms, shipping country pickers, or language/region selectors.

---

## Data Schema (`countries.json`)

The country dataset is stored in `data/countries.json`. Each entry follows this structure:

```json
{
  "name": "United States",
  "iso2": "US",
  "code": "+1",
  "flag": "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f1fa-1f1f8.svg",
  "min": 10,
  "max": 10
}
```

### Field Definitions:

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Full English name of the country. | `"United States"`, `"India"` |
| `iso2` | `string` | Two-letter ISO 3166-1 alpha-2 country code. | `"US"`, `"IN"`, `"GB"` |
| `code` | `string` | International telephone dialing code with `+` prefix. | `"+1"`, `"+91"`, `"+44"` |
| `flag` | `string` | URL to the SVG flag icon on Twemoji CDN. | `https://cdn.jsdelivr.net/...` |
| `min` | `number` | Minimum valid digits for national phone number (excluding country code). | `10` |
| `max` | `number` | Maximum valid digits for national phone number (excluding country code). | `10` |

---

## Form Submission & Payloads

When the user submits the form, validation executes. Upon successful validation, the hidden input fields are updated with clean data:

| Input Field Name | Element ID | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `country_name` | `#countryName` | `"United States"` | Selected country name. |
| `country_code` | `#countryCode` | `"+1"` | International dial code. |
| `country_iso` | `#countryIso` | `"US"` | 2-letter ISO country code. |
| `phone` | `#hiddenPhone` | `"5551234567"` | Sanitized phone number (digits only). |
| `full_phone` | `#fullPhone` | `"+15551234567"` | Full combined international number. |

### Example JavaScript Console Output:
```javascript
{
  country: "United Kingdom",
  iso2: "GB",
  country_code: "+44",
  phone: "7911123456",
  full_phone: "+447911123456"
}
```

---

## How It Works (Technical Flow)

```
[Page Load]
     │
     ▼
[Fetch data/countries.json]
     │
     ▼
[GeoIP Lookup: ipinfo.io JSONP]
     │
     ├── Success ──> Matches visitor's ISO2 code
     └── Failed  ──> Falls back to India ("IN") or first country in list
     │
     ▼
[Populate Country Button & Hidden Fields]
     │
     ▼
[User Input Handling]
     ├── Click Flag Button ──> Toggle searchable dropdown
     ├── Type in Search    ──> Filter list by country name, code, or ISO2
     ├── Select Country    ──> Update active country, flag, code, and placeholder
     ├── Type Number       ──> Strip non-digits (\D) & enforce max length
     │
     ▼
[Form Submission]
     ├── Check empty number ──────────> Show error: "Please enter your phone number"
     ├── Check length < min ──────────> Show error: "Please enter a valid [Country] phone number"
     ├── Check length > max ──────────> Show error: "Please enter a valid [Country] phone number"
     └── Valid ───────────────────────> Populate hidden fields & reveal result box
```

---

## Customization Guide

### Changing the Default Fallback Country
If GeoIP lookup fails or the user is in an unmapped region, the default fallback is configured to India (`"IN"`). You can change this in `js/phone-input.js` or `<script>` in `index.html`:

```javascript
// Find this block:
if (!selectedCountry) {
    selectedCountry = countries.find(function (country) {
        return country.iso2 && country.iso2.toUpperCase() === "IN"; // <-- Change "IN" to your desired ISO2 (e.g. "US", "GB", "DE")
    }) || countries[0];
}
```

### Modifying or Disabling GeoIP Detection
GeoIP lookup is performed using `ipinfo.io` via JSONP:
```javascript
function geoIpLookup(success) {
    $.get("https://ipinfo.io", function () {}, "jsonp")
    .always(function (resp) {
        let countryCode = "";
        if (resp && resp.country) {
            countryCode = String(resp.country).toUpperCase();
        }
        success(countryCode);
    });
}
```

- **To disable GeoIP and always use a fixed country**:
  ```javascript
  function geoIpLookup(success) {
      success("US"); // Instantly returns default country without network request
  }
  ```

### Changing CDN Assets or Flag Providers
If an image fails to load, a fallback globe icon is rendered:
```
https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f310.svg
```
You can replace this fallback URL or host flag SVGs locally inside an `assets/flags/` directory if offline access is required.

---

## Browser Compatibility

- **Chrome / Edge / Chromium**: Latest (desktop & mobile)
- **Mozilla Firefox**: Latest (desktop & mobile)
- **Apple Safari**: Latest (macOS & iOS)
- **Opera**: Latest

Requires JavaScript enabled and jQuery 3.6+.

---

## License

This project is open-source and free to use, modify, and distribute for personal and commercial projects.

