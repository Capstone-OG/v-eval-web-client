import logo from '../../assets/v-eval-logo-v2.png';

export default function BrandLogo({ className = 'w-36', inverted = false }) {
  return <img src={logo} alt="V-Eval" width={1877} height={838}
    draggable={false}
    className={`block h-auto shrink-0 object-contain ${inverted ? 'brightness-0 invert' : ''} ${className}`} />;
}
