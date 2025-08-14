'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ParentCard from '../../shared/ParentCard';
import CustomTreeItemCode from '../code/simpletreecode/CustomTreeItemCode';

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: any,
  ref: React.Ref<HTMLLIElement>
) {
  const { itemId, label, children } = props;

  return (
    <TreeItem
      ref={ref}
      itemId={itemId}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={(theme) => ({
              background: theme.palette.primary.main,
              width: 24,
              height: 24,
              fontSize: '0.8rem',
            })}
          >
            {(label as string)[0]}
          </Avatar>
          <span>{label}</span>
        </Box>
      }
    >
      {children}
    </TreeItem>
  );
});

export default function CustomTreeItemView() {
  return (
    <ParentCard title="CustomTreeItem" codeModel={<CustomTreeItemCode />}>
      <Box sx={{ minHeight: 200, minWidth: 250 }}>
        <SimpleTreeView defaultExpandedItems={['3']}>
          <CustomTreeItem itemId="1" label="Amelia Hart">
            <CustomTreeItem itemId="2" label="Jane Fisher" />
          </CustomTreeItem>
          <CustomTreeItem itemId="3" label="Bailey Monroe">
            <CustomTreeItem itemId="4" label="Freddie Reed" />
            <CustomTreeItem itemId="5" label="Georgia Johnson">
              <CustomTreeItem itemId="6" label="Samantha Malone" />
            </CustomTreeItem>
          </CustomTreeItem>
        </SimpleTreeView>
      </Box>
    </ParentCard>
  );
}