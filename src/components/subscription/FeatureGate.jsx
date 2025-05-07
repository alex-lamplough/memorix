import { useState } from 'react';
import useSubscription from '../../hooks/useSubscription';
import FeatureUpgradeModal from './FeatureUpgradeModal';

/**
 * Component that restricts access to features based on subscription
 * Shows an upgrade modal when a user without access tries to use the feature
 * 
 * @param {Object} props - Component props
 * @param {string} props.feature - Feature identifier
 * @param {string} props.featureName - Human-readable feature name
 * @param {string} props.featureDescription - Description of the feature
 * @param {React.ReactNode} props.children - Child components
 * @param {React.ReactNode} props.fallback - Component to show when feature is not available
 */
const FeatureGate = ({
  feature,
  featureName,
  featureDescription,
  children,
  fallback = null
}) => {
  const { canUseFeature } = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const hasAccess = canUseFeature(feature);
  
  if (hasAccess) {
    return children;
  }
  
  // If no fallback is provided, show the children but trigger the modal on click
  if (!fallback) {
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    };
    
    // Clone children and add onClick handler
    const childrenWithProps = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { 
          onClick: handleClick,
          className: `${child.props.className || ''} cursor-not-allowed opacity-70`
        });
      }
      return child;
    });
    
    return (
      <>
        {childrenWithProps}
        <FeatureUpgradeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          feature={featureName}
          featureDescription={featureDescription}
        />
      </>
    );
  }
  
  // If fallback is provided, show it
  return (
    <>
      {typeof fallback === 'function' 
        ? fallback(() => setIsModalOpen(true)) 
        : fallback}
      <FeatureUpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feature={featureName}
        featureDescription={featureDescription}
      />
    </>
  );
};

export default FeatureGate; 