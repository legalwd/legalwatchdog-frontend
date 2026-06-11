import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { Project } from '@/types/project'

import ProjectsList from '../ProjectsList.vue'

// Mock data
const mockProjects: Project[] = [
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
  {
    id: '3',
    title: 'Employment Law Tracker',
    description: 'Monitor employment and labor law updates',
    master_prompt: null,
    org_id: 'org-1',
    created_at: '2024-03-05T14:00:00Z',
    updated_at: '2024-12-14T09:45:00Z',
    assigned_users: null,
    is_active: true,
    is_deleted: false,
  },
  {
    id: '4',
    title: 'Data Privacy Compliance',
    description: 'GDPR, CCPA, and other data privacy regulations',
    master_prompt: null,
    org_id: 'org-1',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-12-13T16:00:00Z',
    assigned_users: null,
    is_active: true,
    is_deleted: false,
  },
  {
    id: '5',
    title: 'Financial Services Regulations',
    description: 'Banking and financial compliance monitoring',
    master_prompt: null,
    org_id: 'org-1',
    created_at: '2024-04-18T11:00:00Z',
    updated_at: '2024-12-11T13:15:00Z',
    assigned_users: null,
    is_active: false,
    is_deleted: false,
  },
  {
    id: '6',
    title: 'Healthcare Compliance System',
    description: 'Medical and healthcare regulatory tracking',
    master_prompt: null,
    org_id: 'org-1',
    created_at: '2024-05-22T10:30:00Z',
    updated_at: '2024-12-09T14:00:00Z',
    assigned_users: null,
    is_active: true,
    is_deleted: false,
  },
]

const changeItemsByProjectId: Record<string, string[]> = {
  '2': ['Licensing fee increased to £500 from £420.', 'Audit window expanded to 24 months.'],
  '6': [
    'New reporting requirement for AML controls.',
    'Regulator added guidance on filing timelines.',
  ],
}

const changeCountByProjectId: Record<string, number> = {
  '2': 3,
  '6': 2,
}

const changeSeverityByProjectId: Record<string, 'minor' | 'major'> = {
  '2': 'major',
  '6': 'minor',
}

const lastChangeLabelByProjectId: Record<string, string> = {
  '2': '4 hours ago',
  '6': '12 hours ago',
}

// List Stories
const meta = {
  component: ProjectsList,
  title: 'Projects/ProjectsList',
  tags: ['autodocs'],
} satisfies Meta<typeof ProjectsList>

export default meta

type Story = StoryObj<typeof meta>

export const List: Story = {
  args: {
    projects: mockProjects,
    loading: false,
    changeItemsByProjectId,
    changeCountByProjectId,
    changeSeverityByProjectId,
    lastChangeLabelByProjectId,
  },
}

export const Loading: Story = {
  args: {
    projects: [],
    loading: true,
  },
}

export const Empty_List: Story = {
  args: {
    projects: [],
    loading: false,
  },
}

export const SingleProject: Story = {
  args: {
    projects: mockProjects.slice(0, 1),
    loading: false,
    changeItemsByProjectId: {
      '1': ['Eligibility threshold updated to 120 points.'],
    },
    changeCountByProjectId: {
      '1': 1,
    },
    changeSeverityByProjectId: {
      '1': 'minor',
    },
    lastChangeLabelByProjectId: {
      '1': '2 hours ago',
    },
  },
}

export const WithSearch: Story = {
  args: {
    projects: mockProjects,
    loading: false,
  },
}
