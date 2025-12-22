import ExpoModulesCore
import SwiftUI
import UIKit

// MARK: - SwiftUI helpers (iOS 15+)

@available(iOS 15.0, *)
fileprivate struct LikeButtonView: View {
  let liked: Bool
  let count: Int
  let material: Material
  let overlayColor: Color
  let cornerRadius: CGFloat

  var body: some View {
    ZStack {
      // Rounded blur background with Material
      RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        .fill(.clear)
        .background(material, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))

      // Overlay above blur for stable contrast over dynamic video/background
      RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        .fill(overlayColor)

      // Content (HStack) – SF Symbols + count
      HStack(spacing: 6) {
        Image(systemName: liked ? "heart.fill" : "heart")
          .symbolRenderingMode(.hierarchical)
          .font(.system(size: 16, weight: liked ? .bold : .semibold))
          .foregroundStyle(.white)

        Text("\(count)")
          .font(.system(size: 14, weight: liked ? .bold : .semibold, design: .rounded))
          .foregroundColor(.white)
      }
      .padding(.horizontal, 12)
      .padding(.vertical, 8)
    }
    .compositingGroup()
    .clipped()
  }
}

@available(iOS 15.0, *)
fileprivate func material(for name: String?) -> Material {
  switch name?.lowercased() {
  case "systemmaterial": return .regularMaterial
  case "systemthinmaterial": return .thinMaterial
  case "systemultrathinmaterial": return .ultraThinMaterial
  case "systemchromematerial": return .ultraThickMaterial
  case "systemmaterialdark": return .regularMaterial
  case "systemthinmaterialdark": return .thinMaterial
  case "systemultrathinmaterialdark": return .ultraThinMaterial
  case "systemchromematerialdark": return .ultraThickMaterial
  case "systemmateriallight": return .regularMaterial
  case "systemthinmateriallight": return .thinMaterial
  case "systemultrathinmateriallight": return .ultraThinMaterial
  case "systemchromemateriallight": return .ultraThickMaterial
  case "light": return .regularMaterial
  case "dark": return .regularMaterial
  default: return .regularMaterial
  }
}

fileprivate func colorFromString(_ value: String?, defaultColor: UIColor = UIColor(white: 0, alpha: 0.5)) -> UIColor {
  guard let s = value?.trimmingCharacters(in: .whitespacesAndNewlines), !s.isEmpty else {
    return defaultColor
  }
  // rgba(r,g,b,a)
  if s.lowercased().hasPrefix("rgba") {
    let nums = s.filter { "0123456789., ".contains($0) }
      .split(separator: ",")
      .map { Double($0.trimmingCharacters(in: .whitespaces)) ?? 0 }
    if nums.count >= 4 {
      return UIColor(red: CGFloat(nums[0]/255.0), green: CGFloat(nums[1]/255.0), blue: CGFloat(nums[2]/255.0), alpha: CGFloat(nums[3]))
    }
  }
  // rgb(r,g,b)
  if s.lowercased().hasPrefix("rgb") {
    let nums = s.filter { "0123456789., ".contains($0) }
      .split(separator: ",")
      .map { Double($0.trimmingCharacters(in: .whitespaces)) ?? 0 }
    if nums.count >= 3 {
      return UIColor(red: CGFloat(nums[0]/255.0), green: CGFloat(nums[1]/255.0), blue: CGFloat(nums[2]/255.0), alpha: 1)
    }
  }
  // #AARRGGBB or #RRGGBB or #RGB
  var hex = s
  if hex.hasPrefix("#") { hex.removeFirst() }
  if hex.count == 3 {
    let r = String(repeating: hex[hex.startIndex], count: 2)
    let g = String(repeating: hex[hex.index(hex.startIndex, offsetBy: 1)], count: 2)
    let b = String(repeating: hex[hex.index(hex.startIndex, offsetBy: 2)], count: 2)
    hex = r + g + b
  }
  if hex.count == 6 {
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let r = CGFloat((int & 0xFF0000) >> 16) / 255.0
    let g = CGFloat((int & 0x00FF00) >> 8) / 255.0
    let b = CGFloat(int & 0x0000FF) / 255.0
    return UIColor(red: r, green: g, blue: b, alpha: 1)
  }
  if hex.count == 8 {
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let a = CGFloat((int & 0xFF000000) >> 24) / 255.0
    let r = CGFloat((int & 0x00FF0000) >> 16) / 255.0
    let g = CGFloat((int & 0x0000FF00) >> 8) / 255.0
    let b = CGFloat(int & 0x000000FF) / 255.0
    return UIColor(red: r, green: g, blue: b, alpha: a)
  }
  return defaultColor
}

// MARK: - ExpoView

public final class ExpoLikeButtonView: ExpoView {
  // Props
  var liked: Bool = false { didSet { updateContent() } }
  var count: Int = 0 { didSet { updateContent() } }
  var tintName: String? = "systemMaterialDark" { didSet { updateContent() } }
  var overlayUIColor: UIColor = UIColor(white: 0, alpha: 0.5) { didSet { updateContent() } }
  var cornerRadius: CGFloat = 12 {
    didSet {
      layer.cornerRadius = cornerRadius
      layer.masksToBounds = true
      updateContent()
    }
  }

  // Event
  let onPress = EventDispatcher()

  // SwiftUI hosting (iOS 15+)
  @available(iOS 15.0, *)
  private var hostingController: UIHostingController<LikeButtonView>?

  // UIKit fallback
  private var blurView: UIVisualEffectView?
  private var overlayView: UIView?
  private var iconView: UIImageView?
  private var labelView: UILabel?
  private var stack: UIStackView?

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    isUserInteractionEnabled = true
    layer.cornerRadius = cornerRadius
    layer.masksToBounds = true

    let tap = UITapGestureRecognizer(target: self, action: #selector(handleTap))
    addGestureRecognizer(tap)

    updateContent()
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  @objc private func handleTap() {
    onPress(["liked": liked, "count": count])
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    if #available(iOS 15.0, *) {
      hostingController?.view.frame = bounds
    } else {
      blurView?.frame = bounds
      overlayView?.frame = bounds
      stack?.frame = bounds.insetBy(dx: 0, dy: 0)
    }
  }

  private func updateContent() {
    if #available(iOS 15.0, *) {
      let mat = material(for: tintName)
      let overlay = Color(overlayUIColor)

      let view = LikeButtonView(
        liked: liked,
        count: count,
        material: mat,
        overlayColor: overlay,
        cornerRadius: cornerRadius
      )

      if let host = hostingController {
        host.rootView = view
      } else {
        let host = UIHostingController(rootView: view)
        host.view.backgroundColor = .clear
        hostingController = host
        addSubview(host.view)
        host.view.frame = bounds
        host.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      }

      // Remove UIKit fallback if present
      blurView?.removeFromSuperview(); blurView = nil
      overlayView?.removeFromSuperview(); overlayView = nil
      iconView = nil; labelView = nil; stack = nil
    } else {
      // UIKit fallback for < iOS 15
      // Blur
      let effect = UIBlurEffect(style: .systemChromeMaterial)
      if blurView == nil {
        let v = UIVisualEffectView(effect: effect)
        addSubview(v)
        blurView = v
      } else {
        blurView?.effect = effect
      }
      // Overlay
      if overlayView == nil {
        let ov = UIView()
        blurView?.contentView.addSubview(ov)
        overlayView = ov
      }
      overlayView?.backgroundColor = overlayUIColor

      // HStack-like content
      if stack == nil {
        let iv = UIImageView()
        iv.contentMode = .scaleAspectFit
        iv.tintColor = .white
        iv.setContentHuggingPriority(.required, for: .horizontal)

        let lb = UILabel()
        lb.font = .systemFont(ofSize: 14, weight: .semibold)
        lb.textColor = .white

        let st = UIStackView(arrangedSubviews: [iv, lb])
        st.axis = .horizontal
        st.alignment = .center
        st.spacing = 6
        st.isLayoutMarginsRelativeArrangement = true
        st.layoutMargins = UIEdgeInsets(top: 8, left: 12, bottom: 8, right: 12)

        addSubview(st)
        stack = st
        iconView = iv
        labelView = lb
      }

      // Update icon/text
      let symbolName = liked ? "heart.fill" : "heart"
      let config = UIImage.SymbolConfiguration(pointSize: 16, weight: liked ? .bold : .semibold)
      iconView?.image = UIImage(systemName: symbolName, withConfiguration: config)
      iconView?.tintColor = .white
      labelView?.text = "\(count)"

      setNeedsLayout()
      layoutIfNeeded()
    }
  }
}

// MARK: - Module bridge

public final class ExpoLikeButtonModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoLikeButton")

    View(ExpoLikeButtonView.self) {
      Events("onPress")

      Prop("liked") { (view, value: Bool?) in
        view.liked = value ?? false
      }
      Prop("count") { (view, value: Int?) in
        view.count = value ?? 0
      }
      Prop("tint") { (view, value: String?) in
        view.tintName = value
      }
      Prop("overlayColor") { (view, value: String?) in
        view.overlayUIColor = colorFromString(value, defaultColor: UIColor(white: 0, alpha: 0.5))
      }
      Prop("cornerRadius") { (view, value: Double?) in
        view.cornerRadius = CGFloat(value ?? 12)
      }
      // No-op prop for parity with JS, allows disabling overlay visually if needed
      Prop("disabled") { (view, value: Bool?) in
        // In SwiftUI path, overlay opacity can be driven by disabled flag if desired
        // Here we just trigger a refresh by toggling overlay alpha via updateContent
        // For UIKit fallback, we lower overlay alpha when disabled.
        if let v = value {
          if let overlay = view.overlayView {
            overlay.alpha = v ? 0.0 : 1.0
          }
        }
      }
    }
  }
}
