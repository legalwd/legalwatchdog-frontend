import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { Project } from '@/types/project'

import ProjectCard from '../ProjectCard.vue'

// Mock data
const mockProjects: [Project, Project] = [
  {
    id: '1',
    title: 'Corporate Compliance Framework',
    description: 'Comprehensive framework for corporate legal compliance',
    master_prompt: null,
    org_id: 'org-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-10T15:30:00Z',
    assigned_users: null,
    is_active: true,
    is_deleted: false,
  },
  {
    id: '2',
    title: 'Environmental Regulations Monitor',
    description: 'Track environmental law changes across multiple jurisdictions',
    master_prompt: null,
    org_id: 'org-1',
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-12-12T11:20:00Z',
    assigned_users: null,
    is_active: false,
    is_deleted: true,
  },
]

const meta = {
  component: ProjectCard,
  title: 'Projects/ProjectCard',
  tags: ['autodocs'],
} satisfies Meta<typeof ProjectCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    project: mockProjects[0],
    revisionCount: 0,
    lastChangeLabel: '2 hours ago',
  },
}

export const WithLargeCounts: Story = {
  args: {
    project: mockProjects[1],
    revisionCount: 10500,
    changeCount: 12,
    changeSeverity: 'major',
    lastChangeLabel: '4 days ago',
    changeItems: [
      'Eligibility threshold updated to 120 points.',
      'New compliance form required for submissions.',
      'New compliance form required for submissions.',
      'New compliance form required for submissions.',
      'New compliance form required for submissions.',
      'New compliance form required for submissions.',
      'New compliance form required for submissions.',
      'New compliance form required for submissions.',
      'New compliance form required for submissions.',
    ],
  },
}

export const WithLongTitle: Story = {
  args: {
    project: {
      ...mockProjects[0],
      title: 'A Very Long Project Title That Should Be Truncated When It Exceeds Two Lines of Text',
    },
    revisionCount: 2,
    changeCount: 2,
    changeSeverity: 'minor',
    lastChangeLabel: '6 hours ago',
    changeItems: [
      'Eligibility threshold updated to 120 points.',
      'New compliance form required for submissions.',
    ],
  },
}

export const Empty: Story = {
  args: {
    revisionCount: 0,
  },
}

export const Loading: Story = {
  args: {
    project: mockProjects[0],
    isLoading: true,
  },
}

export const MinorChangesOnly: Story = {
  args: {
    project: mockProjects[0],
    changeCount: 2,
    changeSeverity: 'minor',
    lastChangeLabel: '6 hours ago',
    changeItems: [
      'Eligibility threshold updated to 120 points.',
      'New compliance form required for submissions.',
    ],
  },
}

export const MajorChangesOnly: Story = {
  args: {
    project: mockProjects[1],
    changeCount: 3,
    changeSeverity: 'major',
    lastChangeLabel: '4 hours ago',
    changeItems: [
      'Licensing fee increased to £500 from £420.',
      'Audit window expanded to 24 months.',
    ],
  },
}

export const MixedChangesExpanded: Story = {
  args: {
    project: mockProjects[1],
    changeCount: 3,
    changeSeverity: 'major',
    lastChangeLabel: '12 hours ago',
    showChangeDetails: true,
    changeItems: [
      'Application fee now £500, down from £600.',
      'Monthly income requirement lowered to £2,500.',
    ],
  },
}
