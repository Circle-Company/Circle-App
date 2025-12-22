# Quick Test Guide - New Toast System

## 🚀 Quick Start

### 1. Clear Everything
```bash
# Clear Metro cache
npx expo start --clear

# Or full clean
rm -rf node_modules/.cache
watchman watch-del-all  # if using watchman
```

### 2. Run the App
```bash
# iOS
npx expo run:ios --device

# Android
npx expo run:android --device
```

### 3. Test Features

## ✅ Testing Checklist

### Basic Toast Tests

#### Test 1: Network Status Toast
1. **Action:** Turn off WiFi/Airplane mode
2. **Expected:** Red "You are Offline" toast at top
3. **Action:** Turn WiFi back on
4. **Expected:** Green "Connected to Internet" toast at top
5. **Test Gesture:** Swipe up to dismiss

#### Test 2: Upload Success Toast
1. **Action:** Go to Camera → Capture moment → Share/Upload
2. **Expected:** Green "Moment Created" toast with upload icon
3. **Test Duration:** Should auto-dismiss after ~3 seconds
4. **Test Gesture:** Try swiping up/down to dismiss early

#### Test 3: Comment Success Toast
1. **Action:** Comment on any moment in feed
2. **Expected:** Green "Comment Sended" toast with check icon
3. **Test Position:** Should appear at top of screen

#### Test 4: Error Toast
1. **Action:** Try to perform action while offline (e.g., upload)
2. **Expected:** Red error toast
3. **Test Position:** Should appear at configured position

### Camera Gesture Tests

#### Test 5: Capture Button Pan Gesture (Zoom)
1. **Action:** Go to Camera
2. **Action:** Press and hold capture button
3. **Action:** Swipe up (zoom in)
4. **Action:** Swipe down (zoom out)
5. **Expected:** Smooth zoom animation while swiping

#### Test 6: Pinch to Zoom
1. **Action:** Open Camera
2. **Action:** Pinch out with two fingers
3. **Expected:** Camera zooms in
4. **Action:** Pinch in with two fingers
5. **Expected:** Camera zooms out

### Advanced Toast Tests

#### Test 7: Multiple Toasts
1. **Action:** Trigger multiple toasts quickly (e.g., toggle airplane mode multiple times)
2. **Expected:** Toasts stack vertically
3. **Expected:** Each can be dismissed independently

#### Test 8: Different Positions
1. **Action:** Trigger network toast (top position)
2. **Action:** Trigger error in preferences (center position)
3. **Expected:** Toasts appear in different positions
4. **Expected:** Don't overlap

#### Test 9: Swipe Gesture Smoothness
1. **Action:** Show any toast
2. **Action:** Swipe slowly (don't cross threshold)
3. **Expected:** Toast follows finger then springs back
4. **Action:** Swipe fast (cross threshold)
5. **Expected:** Toast dismisses smoothly

#### Test 10: Custom Icons & Colors
1. **Action:** Upload a moment (check icon color)
2. **Action:** Delete moments (error icon color)
3. **Expected:** Icons render correctly
4. **Expected:** Colors match design (green for success, red for error)

## 🎯 Feature Coverage

### Toasts to Test

- [x] **Network Status** (`src/contexts/network.tsx`)
  - Offline notification
  - Online notification
  - Reconnecting notification

- [x] **Upload Success** (`src/contexts/newMoment.tsx`)
  - Image upload
  - Video upload

- [x] **Comment Success** (`src/components/comment/components/comments-input.tsx`)

- [x] **Memory Creation** (`src/contexts/selectMoments.tsx`)

- [x] **Delete Success** (`src/features/all-moments/all_moments_context.tsx`)

- [x] **Report Success** (`src/features/list-moments/components/feed/render-report-modal-feed.tsx`)

- [x] **Camera Upload** (`src/modules/camera/pages/share.tsx`)

- [x] **Preferences Errors** (`src/state/queries/preferences-*.ts`)

### Gestures to Test

- [x] **Pan Gesture** (CaptureButton zoom)
- [x] **Pinch Gesture** (Camera zoom)
- [x] **Swipe to Dismiss** (All toasts)

## 🐛 What to Look For

### Common Issues

1. **Toast Not Appearing**
   - Check console for errors
   - Verify `ToastProvider` is mounted in app root
   - Check if toast duration is too short

2. **Gesture Not Working**
   - Verify GestureHandlerRootView wraps app
   - Check if gesture-handler is properly installed
   - Rebuild app if needed

3. **Animation Glitches**
   - Check if Reanimated is configured correctly
   - Look for conflicting animations
   - Verify worklet directives are present

4. **Multiple Toasts Overlap**
   - Check position configuration
   - Verify z-index is correct
   - Test with different positions

### Performance Checks

- [ ] Toasts animate smoothly (60fps)
- [ ] No lag when showing multiple toasts
- [ ] Gestures feel responsive
- [ ] No memory leaks (toasts clean up after dismiss)

## 📊 Test Results Template

Copy this to document your testing:

```
## Test Results - [Date]

### Environment
- Device: [iPhone 15 Pro / Samsung Galaxy S23 / etc]
- OS Version: [iOS 17.2 / Android 14 / etc]
- App Version: [1.0.0]

### Tests Passed ✅
- [ ] Network status toasts
- [ ] Upload success toasts
- [ ] Comment success toasts
- [ ] Error toasts
- [ ] Pan gesture (zoom)
- [ ] Pinch gesture (zoom)
- [ ] Swipe to dismiss
- [ ] Multiple toasts
- [ ] Different positions

### Issues Found 🐛
1. [Issue description]
   - Steps to reproduce
   - Expected behavior
   - Actual behavior

### Performance Notes 📈
- Animation smoothness: [Good/Okay/Poor]
- Gesture responsiveness: [Good/Okay/Poor]
- Memory usage: [Normal/High]

### Screenshots/Videos
[Attach if available]
```

## 🔧 Debug Tips

### Enable Debug Mode

Add this to see toast events:

```typescript
// In src/contexts/Toast/index.tsx
console.log('Toast shown:', config)
console.log('Toast dismissed:', id)
```

### Test Individual Toasts

Create a test screen:

```typescript
import { useToast } from "@/contexts/Toast"

export function ToastTestScreen() {
    const toast = useToast()
    
    return (
        <View>
            <Button 
                title="Test Success" 
                onPress={() => toast.success("Success!")} 
            />
            <Button 
                title="Test Error" 
                onPress={() => toast.error("Error!")} 
            />
            <Button 
                title="Test Warning" 
                onPress={() => toast.warning("Warning!")} 
            />
            <Button 
                title="Test Center" 
                onPress={() => toast.info("Info", { position: "center" })} 
            />
        </View>
    )
}
```

## 📝 Report Issues

If you find bugs, report with:

1. **Device & OS:** [iPhone 15 Pro, iOS 17.2]
2. **Steps to reproduce:** [1. Open app, 2. Turn off WiFi, 3. ...]
3. **Expected:** [Green toast should appear]
4. **Actual:** [No toast appears]
5. **Console errors:** [Paste any errors]
6. **Screenshot/Video:** [If possible]

## ✅ Sign Off

Once all tests pass:

```
Tested by: [Your Name]
Date: [Date]
Device: [Device Model]
Result: PASSED ✅ / FAILED ❌
Notes: [Any additional notes]
```

---

**Good luck testing! 🎉**