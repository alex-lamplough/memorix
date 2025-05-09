# Unused or Redundant Files in Memorix Codebase

## Files Cleaned Up ✅

1. **Legacy Structure**:
   - `/app` directory and its contents - Removed
   
2. **Duplicate Assets**:
   - `onoarding-complete.png` (misspelled version) - Removed
   - `linkedinlogo.jpg` and `LinkeedIn.png` (unused LinkedIn logos) - Removed
   - `MemorixLogoImage.psd` (source file) - Removed
   - Redundant Memorix logo files - Removed:
     - `MemorixLogo.png`
     - `MemorixLogoGreen.png`
     - `MemorixLogoWhite.png`
     - `MemorixLogoImage.png`
     - `MemorixBannerLogo.png`

3. **Unused Components**:
   - `/src/components/FlashcardStudy.jsx` - Removed
   - `/src/pages/FlashcardStudyExample.jsx` - Removed
   - `/src/pages/Progress.jsx` - Already removed

## Other Items To Address

1. **Potential API/Service Redundancy**:
   - The `/src/api/queries` directory contains files that may have functionality overlapping with the services in `/src/services`. This could lead to confusion about which API functions to use.

2. **Documentation Issues**:
   - The docs mentioned in the `.cursor/rules/memorix-docs.mdc` file don't appear to exist in the expected locations, which might indicate documentation is out of date or missing.

## Additional Considerations
- Check if there are any backend API routes specific to these unused components that could also be removed.
- Consider creating stubs or placeholders if these components are planned for future use.
- Review the relationship between `/src/api/queries` and `/src/services` to determine if consolidation would improve code organization. 