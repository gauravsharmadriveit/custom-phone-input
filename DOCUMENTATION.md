# Developer & Integration Documentation

This document provides a detailed technical reference and integration guide for the **Custom Phone Input & Country Selector** project.

---

## 1. Architecture & Design Principles

The widget is built around three core principles:
1. **Progressive Enhancement**: Existing native input fields (`<input type="tel">` or `<select>`) can be upgraded into rich custom components while preserving standard form submission mechanics.
2. **Data-Driven Rules**: Country codes, SVG flag URLs, and length constraints are decoupled from the UI logic and loaded from [`data/countries.json`](file:///c:/Users/Dell/Downloads/custom-phone-input/data/countries.json).
3. **Zero Heavy Framework Dependencies**: Requires only jQuery (v3.x) and standard modern browser APIs.

```
┌────────────────────────────────────────────────────────┐
│                      HTML Form                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │               .custom-phone                      │  │
│  │  [ Flag + Code Button ] ──> [ Dropdown / Search ]│  │
│  │  [ Phone Input Field  ] ──> [ Digit Filtering   ]│  │
│  └──────────────────────────────────────────────────┘  │
│  Hidden Inputs: country_name, country_code,            │
│                 country_iso, phone, full_phone         │
└──────────────────────────┬─────────────────────────────┘
                           │ (Form Submit)
                           ▼
              ┌──────────────────────────┐
              │ Per-Country Validation   │
              │   (min/max length check) │
              └────────────┬─────────────┘
                           │ Passed
                           ▼
              ┌──────────────────────────┐
              │ Backend / AJAX Handler   │
              └──────────────────────────┘
```

---

## 2. Step-by-Step Integration Guide

### Step 2.1: Include Required Dependencies
Add the stylesheet and icons to your HTML `<head>`:

```html
<!-- Bootstrap Icons for search icon and chevron arrow -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<!-- Custom Phone Input styles -->
<link rel="stylesheet" href="css/style.css">
```

Before the closing `</body>` tag, include jQuery and the widget script:

```html
<!-- jQuery 3.7.1 -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Custom Phone Input Script -->
<script src="js/phone-input.js"></script>
```

---

### Step 2.2: Add HTML Markup
Insert the following structure inside your form:

```html
<form id="phoneForm" method="POST" action="/submit-phone">
    <label for="phoneNumber" class="phone-label">Mobile Number</label>

    <div class="custom-phone">
        <!-- Country selector button -->
        <button type="button" class="country-button" id="countryButton" aria-haspopup="listbox" aria-expanded="false">
            <img src="" class="country-flag" id="selectedFlag" alt="Flag">
            <span class="country-code" id="selectedCode"></span>
            <i class="bi bi-chevron-down country-arrow"></i>
        </button>

        <!-- Numeric phone input -->
        <input type="tel" id="phoneNumber" class="phone-number"
               placeholder="Enter mobile number" autocomplete="tel" inputmode="numeric">

        <!-- Searchable country dropdown -->
        <div class="country-dropdown" id="countryDropdown">
            <div class="country-search">
                <i class="bi bi-search"></i>
                <input type="text" id="countrySearch" placeholder="Search country or code..." autocomplete="off">
            </div>
            <div class="country-list" id="countryList" role="listbox"></div>
        </div>
    </div>

    <!-- Feedback messages -->
    <div class="phone-error" id="phoneError"></div>
    <div class="phone-success" id="phoneSuccess"></div>

    <!-- Hidden form fields sent to the server -->
    <input type="hidden" name="country_name" id="countryName">
    <input type="hidden" name="country_code" id="countryCode">
    <input type="hidden" name="country_iso"  id="countryIso">
    <input type="hidden" name="phone"        id="hiddenPhone">
    <input type="hidden" name="full_phone"   id="fullPhone">

    <button type="submit" class="submit-btn">Submit</button>
</form>
```

---

## 3. Component API & Lifecycle Reference

### JavaScript Functions (in [`js/phone-input.js`](file:///c:/Users/Dell/Downloads/custom-phone-input/js/phone-input.js))

| Function | Parameters | Description |
| :--- | :--- | :--- |
| `geoIpLookup(callback)` | `callback(countryCode)` | Queries `https://ipinfo.io` (via JSONP) to get user's two-letter ISO country code. |
| `updateSelectedCountry()` | *None* | Updates flag image, dialing code text, placeholder, and hidden inputs with the current `selectedCountry`. |
| `renderCountries(search)` | `search` *(string, optional)* | Filters and renders matching country items in `#countryList` matching name, code, or ISO2. |

### DOM Events Handled

1. **Flag Button Click (`#countryButton`)**:
   Toggles dropdown visibility (`.show` class) and rotates the chevron arrow.
2. **Search Input (`#countrySearch`)**:
   Runs real-time filtering on keystroke (`input` event).
3. **Country Item Click (`.country-item`)**:
   Sets `selectedCountry`, updates UI, closes dropdown, clears previous input and validation errors.
4. **Outside Click Detection (`$(document).on("click")`)**:
   Closes dropdown if user clicks anywhere outside `.custom-phone`.
5. **Phone Number Input (`#phoneNumber`)**:
   - Strips non-digit characters (`/\D/g`).
   - Slices input if length exceeds `selectedCountry.max`.
   - Clears existing validation errors.
6. **Form Submit (`#phoneForm`)**:
   - Verifies country selection.
   - Verifies phone is not empty.
   - Enforces `minLength <= length <= maxLength`.
   - Populates `#hiddenPhone` and `#fullPhone`.

---

## 4. Backend Processing Examples

When submitted via standard HTML POST form or AJAX, the server receives the populated hidden fields:

### PHP Example (`submit-phone.php`)
```php
<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $countryName = filter_input(INPUT_POST, 'country_name', FILTER_SANITIZE_SPECIAL_CHARS);
    $countryCode = filter_input(INPUT_POST, 'country_code', FILTER_SANITIZE_SPECIAL_CHARS);
    $countryIso  = filter_input(INPUT_POST, 'country_iso', FILTER_SANITIZE_SPECIAL_CHARS);
    $phone       = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_NUMBER_INT);
    $fullPhone   = filter_input(INPUT_POST, 'full_phone', FILTER_SANITIZE_SPECIAL_CHARS);

    if (empty($phone) || empty($countryCode)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid phone number."]);
        exit;
    }

    // Save to database or trigger SMS verification (e.g. Twilio)
    echo json_encode([
        "status" => "success",
        "full_phone" => $fullPhone
    ]);
}
?>
```

### Node.js / Express Example
```javascript
app.post("/submit-phone", (req, res) => {
    const { country_name, country_code, country_iso, phone, full_phone } = req.body;

    if (!phone || !country_code) {
        return res.status(400).json({ error: "Missing required phone fields." });
    }

    console.log(`Received phone: ${full_phone} (${country_name})`);
    res.json({ success: true, verified: false, phone: full_phone });
});
```

---

## 5. CSS Customization & Theming

The widget styles in [`css/style.css`](file:///c:/Users/Dell/Downloads/custom-phone-input/css/style.css) and [`index.html`](file:///c:/Users/Dell/Downloads/custom-phone-input/index.html) use clean CSS rules and variables:

```css
:root {
    --ink: #1b2430;        /* Main text color */
    --muted: #6b7686;      /* Subtitle & icon color */
    --line: #d5dbe3;       /* Border & separator line */
    --accent: #0f5c8c;     /* Focus highlight & primary buttons */
    --accent-soft: #e6f0f7;/* Hover states & selected list background */
    --ok: #1a7f4b;         /* Success text */
    --err: #c0392b;        /* Error validation text */
    --bg: #f6f8fa;         /* Page background */
}
```

To adapt the component to your brand palette, simply override these variables in your root CSS file.

---

## 6. Troubleshooting & FAQ

### Q: Why do I get a CORS error or why is country list empty when opened directly from file explorer?
**Answer**: Modern web browsers restrict local `file:///` AJAX requests (`$.getJSON`) for security reasons. Run the project using any local web server (e.g., VS Code Live Server or `python -m http.server 8000`).

### Q: What happens if `ipinfo.io` is unreachable or ad-blocked?
**Answer**: The script catches connection failures using jQuery's `.always()` handler and automatically falls back to India (`+91` / `IN`) or the first entry in [`data/countries.json`](file:///c:/Users/Dell/Downloads/custom-phone-input/data/countries.json), ensuring the form never breaks.

### Q: Can I use local flag images instead of the Twemoji CDN?
**Answer**: Yes. Download the flag SVGs into an `assets/flags/` folder and replace the flag URL pattern in [`data/countries.json`](file:///c:/Users/Dell/Downloads/custom-phone-input/data/countries.json) or adjust the `flagImg()` helper.

---

## 7. Standalone Country Selector (`country-select.html`)

If your form only needs a country dropdown (e.g., for shipping addresses or billing info) without the telephone number input, refer to [`country-select.html`](file:///c:/Users/Dell/Downloads/custom-phone-input/country-select.html).

Key features of the standalone picker:
- Enhances standard `<select id="countrySelect">` automatically.
- Accessible ARIA attributes (`role="listbox"`, `role="option"`).
- Keyboard support: Pressing <kbd>Escape</kbd> closes the dropdown.
- Keeps native `<select>` synchronized for compatibility with vanilla form submissions.

