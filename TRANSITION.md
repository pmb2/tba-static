# Transitioning from /out/ to Root Directory

This document outlines the steps required to fully transition from serving the site from the `/out/` directory to serving it directly from the root directory.

## Current Setup

Currently, the site is built into the `/out/` directory and then the GitHub Actions workflow copies the files from `/out/` to the root for deployment. This creates duplication and potential confusion.

## Transition Plan

To fully migrate away from the `/out/` directory and build directly to the root:

1. **Update Next.js Configuration**

   The `next.config.js` file has been created to build directly to the root:

   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     distDir: './',
     assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
     // ...other settings
   }

   module.exports = nextConfig
   ```

2. **Update All Script References**

   Ensure all HTML files reference scripts from the root paths:

   ```html
   <\!-- Before -->
   <script src="js/form-handler.js"></script>

   <\!-- After -->
   <script src="/js/form-handler.js"></script>
   ```

3. **Update Image and Asset Paths**

   Use absolute paths (starting with `/`) for all assets:

   ```html
   <\!-- Before -->
   <img src="images/logo.png">

   <\!-- After -->
   <img src="/images/logo.png">
   ```

4. **Deploy Without /out/**

   Run the build and deployment process without copying from `/out/`:

   ```bash
   npm run build
   # Files are now built directly to the root
   ```

5. **Clean Up /out/ Directory**

   Once the transition is complete and verified, you can remove the `/out/` directory:

   ```bash
   rm -rf out/
   ```

## Testing the Transition

Before fully committing to the transition:

1. Run a local build test to ensure files are generated correctly
2. Test all links and forms to ensure they work with the new file structure
3. Verify that scripts load correctly
4. Check that all assets (images, CSS) are accessible

## Fallback Plan

If issues arise, you can temporarily revert to the `/out/` directory approach:

1. Update the GitHub workflow to copy from `/out/` to root
2. Modify `next.config.js` to use the default `out` directory
3. Deploy with the original workflow that copies files from `/out/`

## Full Removal of /out/

After successful transition and testing:

1. Remove all references to `/out/` in the codebase
2. Update the GitHub workflow to no longer copy from `/out/`
3. Delete the `/out/` directory from the repository
EOL < /dev/null
