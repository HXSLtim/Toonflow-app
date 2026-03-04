# Master Feature Baseline

> Purpose: parity reference checklist from `master` routes/pages/scripts.

- Baseline branch: `master`
- Baseline commit: `976fa5aa56df85c17b8f3a4076908eca83a7b5bf`
- Generated at: `2026-03-04T12:50:14.057Z`
- Scope: `src/routes/**`, `app/src/pages/**`, root `package.json` scripts

## Summary

- Route items: 96
- Page items: 11
- Script items: 12
- Total items: 119

## 1) API Route Baseline (`src/routes/**`)

- [ ] `src/routes/assets/addAssets.ts` — evidence: `src/routes/assets/addAssets.ts`
- [ ] `src/routes/assets/delAssets.ts` — evidence: `src/routes/assets/delAssets.ts`
- [ ] `src/routes/assets/delAssetsImage.ts` — evidence: `src/routes/assets/delAssetsImage.ts`
- [ ] `src/routes/assets/generateAssets.ts` — evidence: `src/routes/assets/generateAssets.ts`
- [ ] `src/routes/assets/getAssets.ts` — evidence: `src/routes/assets/getAssets.ts`
- [ ] `src/routes/assets/getImage.ts` — evidence: `src/routes/assets/getImage.ts`
- [ ] `src/routes/assets/getStoryboard.ts` — evidence: `src/routes/assets/getStoryboard.ts`
- [ ] `src/routes/assets/polishPrompt.ts` — evidence: `src/routes/assets/polishPrompt.ts`
- [ ] `src/routes/assets/saveAssets.ts` — evidence: `src/routes/assets/saveAssets.ts`
- [ ] `src/routes/assets/updateAssets.ts` — evidence: `src/routes/assets/updateAssets.ts`
- [ ] `src/routes/batch/cancelBatchTask.ts` — evidence: `src/routes/batch/cancelBatchTask.ts`
- [ ] `src/routes/batch/createBatchTask.ts` — evidence: `src/routes/batch/createBatchTask.ts`
- [ ] `src/routes/batch/getBatchTaskStatus.ts` — evidence: `src/routes/batch/getBatchTaskStatus.ts`
- [ ] `src/routes/costume/addCostume.ts` — evidence: `src/routes/costume/addCostume.ts`
- [ ] `src/routes/costume/checkConsistency.ts` — evidence: `src/routes/costume/checkConsistency.ts`
- [ ] `src/routes/costume/deleteCostume.ts` — evidence: `src/routes/costume/deleteCostume.ts`
- [ ] `src/routes/costume/generateCostume.ts` — evidence: `src/routes/costume/generateCostume.ts`
- [ ] `src/routes/costume/getCostumes.ts` — evidence: `src/routes/costume/getCostumes.ts`
- [ ] `src/routes/costume/updateCostume.ts` — evidence: `src/routes/costume/updateCostume.ts`
- [ ] `src/routes/format/convertFormat.ts` — evidence: `src/routes/format/convertFormat.ts`
- [ ] `src/routes/format/detectFormat.ts` — evidence: `src/routes/format/detectFormat.ts`
- [ ] `src/routes/format/parseFormat.ts` — evidence: `src/routes/format/parseFormat.ts`
- [ ] `src/routes/index/index.ts` — evidence: `src/routes/index/index.ts`
- [ ] `src/routes/monitoring/health.ts` — evidence: `src/routes/monitoring/health.ts`
- [ ] `src/routes/monitoring/metrics.ts` — evidence: `src/routes/monitoring/metrics.ts`
- [ ] `src/routes/novel/addNovel.ts` — evidence: `src/routes/novel/addNovel.ts`
- [ ] `src/routes/novel/delNovel.ts` — evidence: `src/routes/novel/delNovel.ts`
- [ ] `src/routes/novel/getNovel.ts` — evidence: `src/routes/novel/getNovel.ts`
- [ ] `src/routes/novel/updateNovel.ts` — evidence: `src/routes/novel/updateNovel.ts`
- [ ] `src/routes/other/clearDatabase.ts` — evidence: `src/routes/other/clearDatabase.ts`
- [ ] `src/routes/other/deleteAllData.ts` — evidence: `src/routes/other/deleteAllData.ts`
- [ ] `src/routes/other/getCaptcha.ts` — evidence: `src/routes/other/getCaptcha.ts`
- [ ] `src/routes/other/login.ts` — evidence: `src/routes/other/login.ts`
- [ ] `src/routes/other/testAI.ts` — evidence: `src/routes/other/testAI.ts`
- [ ] `src/routes/other/testImage.ts` — evidence: `src/routes/other/testImage.ts`
- [ ] `src/routes/other/testVideo.ts` — evidence: `src/routes/other/testVideo.ts`
- [ ] `src/routes/outline/addOutline.ts` — evidence: `src/routes/outline/addOutline.ts`
- [ ] `src/routes/outline/agentsOutline.ts` — evidence: `src/routes/outline/agentsOutline.ts`
- [ ] `src/routes/outline/delOutline.ts` — evidence: `src/routes/outline/delOutline.ts`
- [ ] `src/routes/outline/getHistory.ts` — evidence: `src/routes/outline/getHistory.ts`
- [ ] `src/routes/outline/getOutline.ts` — evidence: `src/routes/outline/getOutline.ts`
- [ ] `src/routes/outline/getPartScript.ts` — evidence: `src/routes/outline/getPartScript.ts`
- [ ] `src/routes/outline/getStoryline.ts` — evidence: `src/routes/outline/getStoryline.ts`
- [ ] `src/routes/outline/setHistory.ts` — evidence: `src/routes/outline/setHistory.ts`
- [ ] `src/routes/outline/updateOutline.ts` — evidence: `src/routes/outline/updateOutline.ts`
- [ ] `src/routes/outline/updateScript.ts` — evidence: `src/routes/outline/updateScript.ts`
- [ ] `src/routes/outline/updateStoryline.ts` — evidence: `src/routes/outline/updateStoryline.ts`
- [ ] `src/routes/performance/getMetrics.ts` — evidence: `src/routes/performance/getMetrics.ts`
- [ ] `src/routes/project/addProject.ts` — evidence: `src/routes/project/addProject.ts`
- [ ] `src/routes/project/delProject.ts` — evidence: `src/routes/project/delProject.ts`
- [ ] `src/routes/project/getProject.ts` — evidence: `src/routes/project/getProject.ts`
- [ ] `src/routes/project/getProjectCount.ts` — evidence: `src/routes/project/getProjectCount.ts`
- [ ] `src/routes/project/getSingleProject.ts` — evidence: `src/routes/project/getSingleProject.ts`
- [ ] `src/routes/project/updateProject.ts` — evidence: `src/routes/project/updateProject.ts`
- [ ] `src/routes/prompt/getPrompts.ts` — evidence: `src/routes/prompt/getPrompts.ts`
- [ ] `src/routes/prompt/updatePrompt.ts` — evidence: `src/routes/prompt/updatePrompt.ts`
- [ ] `src/routes/script/generateScriptApi.ts` — evidence: `src/routes/script/generateScriptApi.ts`
- [ ] `src/routes/script/generateScriptSave.ts` — evidence: `src/routes/script/generateScriptSave.ts`
- [ ] `src/routes/script/getScriptApi.ts` — evidence: `src/routes/script/getScriptApi.ts`
- [ ] `src/routes/setting/addModel.ts` — evidence: `src/routes/setting/addModel.ts`
- [ ] `src/routes/setting/configurationModel.ts` — evidence: `src/routes/setting/configurationModel.ts`
- [ ] `src/routes/setting/delModel.ts` — evidence: `src/routes/setting/delModel.ts`
- [ ] `src/routes/setting/getAiModelList.ts` — evidence: `src/routes/setting/getAiModelList.ts`
- [ ] `src/routes/setting/getAiModelMap.ts` — evidence: `src/routes/setting/getAiModelMap.ts`
- [ ] `src/routes/setting/getLog.ts` — evidence: `src/routes/setting/getLog.ts`
- [ ] `src/routes/setting/getSetting.ts` — evidence: `src/routes/setting/getSetting.ts`
- [ ] `src/routes/setting/getVideoModelDetail.ts` — evidence: `src/routes/setting/getVideoModelDetail.ts`
- [ ] `src/routes/setting/getVideoModelList.ts` — evidence: `src/routes/setting/getVideoModelList.ts`
- [ ] `src/routes/setting/updateModel.ts` — evidence: `src/routes/setting/updateModel.ts`
- [ ] `src/routes/storyboard/batchSuperScoreImage.ts` — evidence: `src/routes/storyboard/batchSuperScoreImage.ts`
- [ ] `src/routes/storyboard/chatStoryboard.ts` — evidence: `src/routes/storyboard/chatStoryboard.ts`
- [ ] `src/routes/storyboard/delStoryboard.ts` — evidence: `src/routes/storyboard/delStoryboard.ts`
- [ ] `src/routes/storyboard/generateShotImage.ts` — evidence: `src/routes/storyboard/generateShotImage.ts`
- [ ] `src/routes/storyboard/generateStoryboardApi.ts` — evidence: `src/routes/storyboard/generateStoryboardApi.ts`
- [ ] `src/routes/storyboard/generateVideoPrompt.ts` — evidence: `src/routes/storyboard/generateVideoPrompt.ts`
- [ ] `src/routes/storyboard/getStoryboard.ts` — evidence: `src/routes/storyboard/getStoryboard.ts`
- [ ] `src/routes/storyboard/keepStoryboard.ts` — evidence: `src/routes/storyboard/keepStoryboard.ts`
- [ ] `src/routes/storyboard/saveStoryboard.ts` — evidence: `src/routes/storyboard/saveStoryboard.ts`
- [ ] `src/routes/storyboard/uploadImage.ts` — evidence: `src/routes/storyboard/uploadImage.ts`
- [ ] `src/routes/task/getTaskApi.ts` — evidence: `src/routes/task/getTaskApi.ts`
- [ ] `src/routes/task/taskDetails.ts` — evidence: `src/routes/task/taskDetails.ts`
- [ ] `src/routes/user/getUser.ts` — evidence: `src/routes/user/getUser.ts`
- [ ] `src/routes/user/saveUser.ts` — evidence: `src/routes/user/saveUser.ts`
- [ ] `src/routes/video/addVideo.ts` — evidence: `src/routes/video/addVideo.ts`
- [ ] `src/routes/video/addVideoConfig.ts` — evidence: `src/routes/video/addVideoConfig.ts`
- [ ] `src/routes/video/deleteVideoConfig.ts` — evidence: `src/routes/video/deleteVideoConfig.ts`
- [ ] `src/routes/video/generatePrompt.ts` — evidence: `src/routes/video/generatePrompt.ts`
- [ ] `src/routes/video/generateVideo.ts` — evidence: `src/routes/video/generateVideo.ts`
- [ ] `src/routes/video/getManufacturer.ts` — evidence: `src/routes/video/getManufacturer.ts`
- [ ] `src/routes/video/getVideo.ts` — evidence: `src/routes/video/getVideo.ts`
- [ ] `src/routes/video/getVideoConfigs.ts` — evidence: `src/routes/video/getVideoConfigs.ts`
- [ ] `src/routes/video/getVideoModel.ts` — evidence: `src/routes/video/getVideoModel.ts`
- [ ] `src/routes/video/getVideoStoryboards.ts` — evidence: `src/routes/video/getVideoStoryboards.ts`
- [ ] `src/routes/video/reviseVideoStoryboards.ts` — evidence: `src/routes/video/reviseVideoStoryboards.ts`
- [ ] `src/routes/video/saveVideo.ts` — evidence: `src/routes/video/saveVideo.ts`
- [ ] `src/routes/video/upDateVideoConfig.ts` — evidence: `src/routes/video/upDateVideoConfig.ts`

## 2) Frontend Page Baseline (`app/src/pages/**`)

- [ ] `app/src/pages/ComponentsShowcase.tsx` — evidence: `app/src/pages/ComponentsShowcase.tsx`
- [ ] `app/src/pages/Dashboard.tsx` — evidence: `app/src/pages/Dashboard.tsx`
- [ ] `app/src/pages/Home.tsx` — evidence: `app/src/pages/Home.tsx`
- [ ] `app/src/pages/Login.tsx` — evidence: `app/src/pages/Login.tsx`
- [ ] `app/src/pages/NotFound.tsx` — evidence: `app/src/pages/NotFound.tsx`
- [ ] `app/src/pages/ProjectDetail.tsx` — evidence: `app/src/pages/ProjectDetail.tsx`
- [ ] `app/src/pages/Projects.tsx` — evidence: `app/src/pages/Projects.tsx`
- [ ] `app/src/pages/Scripts.tsx` — evidence: `app/src/pages/Scripts.tsx`
- [ ] `app/src/pages/Settings.tsx` — evidence: `app/src/pages/Settings.tsx`
- [ ] `app/src/pages/Storyboards.tsx` — evidence: `app/src/pages/Storyboards.tsx`
- [ ] `app/src/pages/Videos.tsx` — evidence: `app/src/pages/Videos.tsx`

## 3) Root Script Baseline (`package.json` `scripts`)

- [ ] `dev` -> `nodemon --inspect --exec tsx src/app.ts` — evidence: `package.json#scripts.dev`
- [ ] `lint` -> `tsc --noEmit` — evidence: `package.json#scripts.lint`
- [ ] `build` -> `cross-env NODE_ENV=prod tsx scripts/build.ts` — evidence: `package.json#scripts.build`
- [ ] `test` -> `vitest --run` — evidence: `package.json#scripts.test`
- [ ] `test:watch` -> `vitest` — evidence: `package.json#scripts.test:watch`
- [ ] `test:ui` -> `vitest --ui` — evidence: `package.json#scripts.test:ui`
- [ ] `test:coverage` -> `vitest --run --coverage` — evidence: `package.json#scripts.test:coverage`
- [ ] `test:prod` -> `cross-env NODE_ENV=prod node build/app.js` — evidence: `package.json#scripts.test:prod`
- [ ] `docker:build` -> `docker-compose -f docker/docker-compose.yml up -d --build` — evidence: `package.json#scripts.docker:build`
- [ ] `docker:local` -> `docker-compose -f docker/docker-compose.local.yml up -d --build` — evidence: `package.json#scripts.docker:local`
- [ ] `debug:ai` -> `npx @ai-sdk/devtools` — evidence: `package.json#scripts.debug:ai`
- [ ] `license` -> `bun run scripts/license.ts` — evidence: `package.json#scripts.license`

## 4) Verification Commands

- `git -C C:/Users/a2778/Desktop/Code/Toonflow-app rev-parse HEAD`
- `git -C C:/Users/a2778/Desktop/Code/Toonflow-app ls-files src/routes`
- `git -C C:/Users/a2778/Desktop/Code/Toonflow-app ls-files app/src/pages`
- `node -e "const pkg=require(+root+/package.json); console.log(Object.keys(pkg.scripts||{}))"`
