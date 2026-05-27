export interface ModuleFile {
  slug: string
  title: string
  path: string
  size: number
}

export interface Module {
  id: string
  files: ModuleFile[]
}

export interface ModuleMeta {
  id: string
  title: string
  description: string
  icon: string
  category: string
  color: string
}

export interface ReadProgress {
  [key: string]: boolean
}