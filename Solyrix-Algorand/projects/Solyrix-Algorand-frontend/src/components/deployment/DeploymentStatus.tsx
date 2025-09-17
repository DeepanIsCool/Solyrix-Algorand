import React, { useState, useEffect } from 'react';
import { blockchainService } from '../../services/blockchain.service';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CommandLineIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const DeploymentStatus: React.FC = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const [isDeployed, setIsDeployed] = useState(false);

  useEffect(() => {
    const status = blockchainService.getDeploymentStatus();
    const deployed = blockchainService.isDeployed();
    
    setDeploymentStatus(status);
    setIsDeployed(deployed);
  }, []);

  if (isDeployed) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
            Smart Contracts Deployed
          </h3>
        </div>
        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
          <p>All smart contracts are deployed and ready for on-chain transactions!</p>
          <div className="mt-2 space-y-1">
            <p>• Context Registry: App ID {deploymentStatus.contextRegistry}</p>
            <p>• License Manager: App ID {deploymentStatus.licenseManager}</p>
            <p>• Governance Token: App ID {deploymentStatus.governanceToken}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Smart Contracts Not Deployed
        </h3>
      </div>
      
      <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-3">
        <p>
          The DecentralAI smart contracts need to be deployed to TestNet before you can perform real on-chain transactions.
        </p>
        
        <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded-md p-3">
          <h4 className="font-medium mb-2 flex items-center">
            <CommandLineIcon className="w-4 h-4 mr-1" />
            Deployment Instructions:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Make sure you have a funded TestNet account</li>
            <li>Set up your deployer mnemonic in environment variables</li>
            <li>Navigate to the contracts directory</li>
            <li>Run: <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">algokit project deploy testnet</code></li>
            <li>Update the app IDs in frontend/.env.local</li>
          </ol>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <h4 className="font-medium mb-2 flex items-center text-blue-800 dark:text-blue-200">
            <InformationCircleIcon className="w-4 h-4 mr-1" />
            Current Status:
          </h4>
          <div className="text-xs space-y-1">
            <p>• Context Registry: {deploymentStatus?.contextRegistry}</p>
            <p>• License Manager: {deploymentStatus?.licenseManager}</p>
            <p>• Governance Token: {deploymentStatus?.governanceToken}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
          <h4 className="font-medium mb-2 flex items-center text-gray-800 dark:text-gray-200">
            <CogIcon className="w-4 h-4 mr-1" />
            What happens after deployment:
          </h4>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>Real on-chain transactions for context creation</li>
            <li>Actual ALGO payments for context purchases</li>
            <li>Smart contract-based license management</li>
            <li>On-chain governance and token operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStatus;
