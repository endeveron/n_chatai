'use client';

import { useState } from 'react';

import { EyeIcon } from '@/core/components/icons/EyeIcon';
import { EyeSlashIcon } from '@/core/components/icons/EyeSlashIcon';

type TVisibilityToggleProps = {
  onClick: () => void;
};

const VisibilityToggle = ({ onClick }: TVisibilityToggleProps) => {
  const [visible, setVisible] = useState(false);

  const handleClick = () => {
    setVisible((prev) => !prev);
    onClick();
  };

  return (
    <div onClick={handleClick}>{visible ? <EyeSlashIcon /> : <EyeIcon />}</div>
  );
};

export default VisibilityToggle;
