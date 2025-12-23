import ExpoModulesCore
import SwiftUI
import UIKit

// MARK: - SwiftUI helpers (iOS 15+)

@available(iOS 15.0, *)
fileprivate struct BlurBackgroundView: View {
  let material: Material
  let overlayColor: Color
  let cornerRadius: CGFloat
  let disabled: Bool

  var body: some View {
    ZStack {
      // Rounded blur background
      RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        .fill(.clear)
        .background(material, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))

      // Optional overlay above blur for contrast
      RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        .fill(overlayColor.opacity(disabled ? 0 : 1))
    }
    .clipped()
    .compositingGroup()
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
    // #RGB -> #RRGGBB
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

// MARK: - ExpoView: native view used by React

public final class ExpoLikeRowView: ExpoView {
  // Props
  var intensity: Double = 50 {
    didSet { updateContent() }
  }
  var tintName: String? = "systemMaterialDark" {
    didSet { updateContent() }
  }
  var overlayUIColor: UIColor = UIColor(white: 0, alpha: 0.5) {
    didSet { updateContent() }
  }
  var cornerRadius: CGFloat = 12 {
    didSet {
      layer.cornerRadius = cornerRadius
      layer.masksToBounds = true
      updateContent()
    }
  }
  var disabled: Bool = false {
    didSet { updateContent() }
  }

  // SwiftUI hosting (iOS 15+)
  @available(iOS 15.0, *)
  private var hostingController: UIHostingController<BlurBackgroundView>?

  // Fallback UIKit blur for iOS < 15
  private var blurView: UIVisualEffectView?
  private var overlayView: UIView?

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    isUserInteractionEnabled = false
    layer.masksToBounds = true
    setupInitial()
  }

  @objc
  public required init(frame: CGRect) {
    super.init(frame: frame)
    isUserInteractionEnabled = false
    layer.masksToBounds = true
    setupInitial()
  }

  @available(*, unavailable)
  public required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  private func setupInitial() {
    layer.cornerRadius = cornerRadius
    updateContent()
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    if #available(iOS 15.0, *) {
      hostingController?.view.frame = bounds
    } else {
      blurView?.frame = bounds
      overlayView?.frame = bounds
      blurView?.layer.cornerRadius = cornerRadius
      overlayView?.layer.cornerRadius = cornerRadius
    }
  }

  func updateContent() {
    if #available(iOS 15.0, *) {
      let materialStyle = material(for: tintName)
      // Always rebuild SwiftUI content on prop changes for simplicity
      let swiftUIView = BlurBackgroundView(
        material: materialStyle,
        overlayColor: Color(overlayUIColor),
        cornerRadius: cornerRadius,
        disabled: disabled
      )
      if let hosting = hostingController {
        hosting.rootView = swiftUIView
      } else {
        let host = UIHostingController(rootView: swiftUIView)
        host.view.backgroundColor = .clear
        hostingController = host
        addSubview(host.view)
        host.view.frame = bounds
        host.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      }
      // Remove UIKit fallback if present
      blurView?.removeFromSuperview()
      overlayView?.removeFromSuperview()
      blurView = nil
      overlayView = nil
    } else {
      // UIKit fallback using UIBlurEffect
      let style: UIBlurEffect.Style = .systemChromeMaterial
      let blur = UIBlurEffect(style: style)
      if blurView == nil {
        let v = UIVisualEffectView(effect: blur)
        v.clipsToBounds = true
        addSubview(v)
        blurView = v
      } else {
        blurView?.effect = blur
      }
      if overlayView == nil {
        let ov = UIView()
        ov.backgroundColor = disabled ? UIColor.clear : overlayUIColor
        ov.isUserInteractionEnabled = false
        blurView?.contentView.addSubview(ov)
        overlayView = ov
      } else {
        overlayView?.backgroundColor = disabled ? UIColor.clear : overlayUIColor
      }
      setNeedsLayout()
      // Remove SwiftUI hosting if present
      hostingController?.view.removeFromSuperview()
      hostingController = nil
    }
  }
}

// MARK: - Module bridge

public final class ExpoLikeRowModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoLikeRow")

    View(ExpoLikeRowView.self) {
      Prop("intensity") { (view, value: Double?) in
        view.intensity = value ?? 50
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

      Prop("disabled") { (view, value: Bool?) in
        view.disabled = value ?? false
      }
    }
  }
}
