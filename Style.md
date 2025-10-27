# LobbyBee UI Style Guide

This document outlines the styling conventions for the LobbyBee application, based on the design of the login and password reset pages.

## Color Palette

-   **Primary Background:** Gradient from light blue to light indigo.
    -   `bg-gradient-to-br from-blue-50 to-indigo-100`
-   **Primary Accent:** A medium blue, used for buttons, links, and focus states.
    -   `blue-500` (#3B82F6)
    -   Hover: `blue-600` (#2563EB)
-   **Secondary Accent (Branding):** A warm gradient from yellow to orange.
    -   `bg-gradient-to-br from-yellow-50 to-orange-100`
-   **Text:**
    -   Headings: Dark gray (`gray-900`, #111827)
    -   Body/Subtitles: Medium gray (`gray-600`, #4B5563)
    -   Muted/Labels: Darker medium gray (`gray-800`, #1F2937)
-   **UI Elements:**
    -   Main content panels: `bg-white`
    -   Input borders: Light gray (`gray-200`, #E5E7EB)
    -   Input focus ring: Very light blue (`blue-100`, #DBEAFE)

## Typography

-   **Font Family:** `font-sans` is preferred for headings.
-   **Headings:**
    -   `font-bold`
    -   Large screens: `text-4xl`
    -   Medium screens: `text-2xl`
-   **Body Text:** `text-base`
-   **Small Text/Links:** `text-sm`

## Spacing & Sizing

-   **Component Height:** Interactive elements like buttons and inputs have a consistent height of `h-12` (3rem).
-   **Form Spacing:** Use `space-y-5` for vertical rhythm between form fields.
-   **Padding:**
    -   Page-level padding: `p-4`
    -   Card/Panel padding: `p-8` or `p-12` for larger cards.

## Borders & Shadows

-   **Corner Radius:** Generous rounding is used to create a soft, modern feel.
    -   Cards: `rounded-2xl` or `rounded-3xl`
    -   Inputs/Buttons: `rounded-lg`
-   **Borders:**
    -   Inputs use a `border-2`.
-   **Shadows:**
    -   Cards have a prominent `shadow-2xl`.
    -   Buttons have a `shadow-lg` on hover to provide tactile feedback.

## Component Styling

### Buttons

-   **Primary Button:**
    -   Solid background: `bg-blue-500`
    -   White text: `text-white`
    -   `h-12`, `rounded-lg`, `text-base`, `font-semibold`
    -   Hover: `bg-blue-600`, `-translate-y-0.5`, `shadow-lg`
    -   Transition: `transition-all duration-200`

### Input Fields

-   **Text & Password Inputs:**
    -   `h-12`, `rounded-lg`, `px-4`
    -   Border: `border-2 border-gray-200`
    -   Focus: `border-blue-500`, `ring-2 ring-blue-100`, `outline-none`
    -   Transition: `transition-all duration-200`

### Links

-   Standard links are `text-sm` and use the primary accent color on hover.
    -   `text-gray-600`, `hover:text-blue-500`, `hover:underline`
