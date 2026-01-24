import fieldLabels from '@/data/dod-field-labels.json'

type SectionMap = Record<string, Record<string, string>>

const labelsBySection = fieldLabels as unknown as SectionMap

const sectionIdMap: Record<string, string> = {
  'Общая информация': '0',
  'Контактная информация': '20',
  'Раздел 1': '1',
  'Раздел 2': '2',
  'Раздел 3': '3',
  'Раздел 4': '4',
  'Раздел 5': '5',
  'Раздел 6': '6',
  'Раздел 7': '7',
  'Раздел 8': '8',
  'Раздел 9': '9',
  'Раздел 10': '10',
  'Раздел 11': '11',
  'Раздел 12': '12',
  'Раздел 13': '13',
  'Раздел 14': '14',
  'Раздел 15': '15',
  'Раздел 16': '16',
  'Раздел 17': '17',
  'Раздел 18': '18'
}

const directFieldLabelMap: Record<string, Record<string, string>> = {
  'Общая информация': {
    organizationName: 'Наименование отчитывающейся организации',
    postalAddress: 'Почтовый адрес',
    okudFormCode: 'Код формы по ОКУД',
    okpoOrgCode: 'Код отчитывающейся организации по ОКПО',
    changeDate1: 'О внесении изменений (при наличии) (дата 1)',
    changeNumber1: 'О внесении изменений (при наличии) (номер 1)',
    changeDate2: 'О внесении изменений (при наличии) (дата 2)',
    changeNumber2: 'О внесении изменений (при наличии) (номер 2)'
  },
  'Контактная информация': {
    position: 'Должность ответственного лица',
    fullName: 'ФИО ответственного лица',
    phoneNumber: 'Номер телефона ответственного лица',
    email: 'Email ответственного лица',
    documentDay: 'День составления документа',
    documentMonth: 'Месяц составления документа',
    documentYear: 'Год составления документа (2 последние цифры)'
  }
}

type FieldEntry = { key: string; label: string; value: unknown }

type FieldDef = {
  key: string
  count?: number
}

const sectionFieldSchema: Record<string, FieldDef[]> = {
  '1': [
    { key: 'organizationType' },
    { key: 'terrainType' }
  ],
  '2': [
    { key: 'personalizedFinancingOfChildrensAdditionalEducation' },
    { key: 'newWageSystem' },
    { key: 'theEducationalActivityLicense' }
  ],
  '3': [
    { key: 'technical', count: 16 },
    { key: 'naturalScience', count: 16 },
    { key: 'tourismAndLocalHistory', count: 16 },
    { key: 'socialAndHumanitarian', count: 16 },
    { key: 'artisticOrientation', count: 16 },
    { key: 'physicalEducationAndSports', count: 16 },
    { key: 'preprofessionalProgramsInTheFieldOfArts', count: 16 },
    { key: 'additionalEducationalProgramsSportsTraining', count: 16 }
  ],
  '4': [
    { key: 'technical', count: 17 },
    { key: 'naturalScience', count: 17 },
    { key: 'tourismAndLocalHistory', count: 17 },
    { key: 'socialAndHumanitarian', count: 17 },
    { key: 'artisticOrientation', count: 17 },
    { key: 'physicalEducationAndSports', count: 17 },
    { key: 'preprofessionalProgramsInTheFieldOfArts', count: 17 },
    { key: 'additionalEducationalProgramsSportsTraining', count: 17 },
    { key: 'numberOfStudentsAdditionalGeneralEducationPrograms', count: 17 }
  ],
  '5': [
    { key: 'technical', count: 5 },
    { key: 'naturalScience', count: 5 },
    { key: 'tourismAndLocalHistory', count: 5 },
    { key: 'socialAndHumanitarian', count: 5 },
    { key: 'artisticOrientation', count: 5 },
    { key: 'physicalEducationAndSports', count: 5 },
    { key: 'preprofessionalProgramsInTheFieldOfArts', count: 5 },
    { key: 'additionalEducationalProgramsSportsTraining', count: 5 }
  ],
  '6': [
    { key: 'hiking' },
    { key: 'excursions' },
    { key: 'inFieldExpeditions' }
  ],
  '7': [
    { key: 'theNumberOfEmployeesIsTotal', count: 11 },
    { key: 'seniorStaffTotal', count: 11 },
    { key: 'seniorStaff', count: 11 },
    { key: 'deputyHeads', count: 11 },
    { key: 'branchManager', count: 11 },
    { key: 'teachingStaffTotal', count: 11 },
    { key: 'teachersOfAdditionalEducation', count: 11 },
    { key: 'trainingAndSupportStaff', count: 11 },
    { key: 'otherStaff', count: 11 },
    { key: 'professionalDevelopment' }
  ],
  '8': [
    { key: 'theNumberOfEmployeesIsTotal', count: 11 },
    { key: 'seniorStaffTotal', count: 11 },
    { key: 'seniorStaff', count: 11 },
    { key: 'deputyHeads', count: 11 },
    { key: 'branchManager', count: 11 },
    { key: 'teachingStaffTotal', count: 11 },
    { key: 'teachersOfAdditionalEducation', count: 11 },
    { key: 'trainingAndSupportStaff', count: 11 },
    { key: 'otherStaff', count: 11 }
  ],
  '9': [
    { key: 'organizationBuildings', count: 13 },
    { key: 'partOfTheBuilding', count: 13 }
  ],
  '10': [
    { key: 'assemblyHallInOrganization' },
    { key: 'assemblyHallThirdPartyOrganization' },
    { key: 'concertHallInOrganization' },
    { key: 'concertHallThirdPartyOrganization' },
    { key: 'gameRoomInOrganization' },
    { key: 'gameRoomThirdPartyOrganization' },
    { key: 'trainingClassInOrganization' },
    { key: 'trainingClassThirdPartyOrganization' },
    { key: 'laboratoryInOrganization' },
    { key: 'laboratoryThirdPartyOrganization' },
    { key: 'workshopInOrganization' },
    { key: 'workshopThirdPartyOrganization' },
    { key: 'choreographyClassesInOrganization' },
    { key: 'choreographyClassesThirdPartyOrganization' },
    { key: 'choreographyClassesWithShowerInOrganization' },
    { key: 'choreographyClassesWithShowerThirdPartyOrganization' },
    { key: 'gymInOrganization' },
    { key: 'gymThirdPartyOrganization' },
    { key: 'gymWithShowerInOrganization' },
    { key: 'gymWithShowerThirdPartyOrganization' },
    { key: 'indoorSwimmingPoolInOrganization' },
    { key: 'indoorSwimmingPoolThirdPartyOrganization' },
    { key: 'lectureHallInOrganization' },
    { key: 'lectureHallThirdPartyOrganization' },
    { key: 'computerRoomInOrganization' },
    { key: 'computerRoomThirdPartyOrganization' },
    { key: 'medicalCenterInOrganization' },
    { key: 'medicalCenterThirdPartyOrganization' },
    { key: 'diningRoomInOrganization' },
    { key: 'diningRoomThirdPartyOrganization' },
    { key: 'museumInOrganization' },
    { key: 'museumThirdPartyOrganization' },
    { key: 'wildlifeCornerInOrganization' },
    { key: 'wildlifeCornerThirdPartyOrganization' },
    { key: 'climbingWallInOrganization' },
    { key: 'climbingWallThirdPartyOrganization' },
    { key: 'touristBaseInOrganization' },
    { key: 'touristBaseThirdPartyOrganization' },
    { key: 'libraryInOrganization' },
    { key: 'libraryThirdPartyOrganization' }
  ],
  '11': [
    { key: 'totalAreaOfBuildingsTotal', count: 5 },
    { key: 'theAreaForEducationalActivities', count: 5 },
    { key: 'theAreaOfThePremisesForStudentsLeisureActivities', count: 5 },
    { key: 'totalLandArea', count: 5 },
    { key: 'theAreaOfTheSportsGround', count: 5 },
    { key: 'theAreaOfTheTrainingAndExperimentalSite', count: 5 }
  ],
  '12': [
    { key: 'personalComputersTotal', count: 3 },
    { key: 'portablePersonalComputers', count: 3 },
    { key: 'tabletComputers', count: 3 },
    { key: 'graphicTabletsComputers', count: 3 },
    { key: 'asPartOfLocalComputerNetworks', count: 3 },
    { key: 'havingAccessToTheInternet', count: 3 },
    { key: 'organizationsWithAccessToTheIntranetPortal', count: 3 },
    { key: 'receivedInTheReportingYear', count: 3 },
    { key: 'electronicTerminals' },
    { key: 'electronicTerminalsWithAccessToInternetResources' },
    { key: 'multimediaProjectors' },
    { key: 'interactiveWhiteboards' },
    { key: 'printers' },
    { key: 'printers3D' },
    { key: 'scanners' },
    { key: 'multifunctionDevices' }
  ],
  '13': [
    { key: 'availabilityOfFixedTelephoneService' },
    { key: 'emailAddress' },
    { key: 'websiteOnTheInternet' },
    { key: 'availabilityOfInformationOnTheWebsiteAboutOrganization' }
  ],
  '14': [
    { key: 'maximumInternetAccessSpeed' },
    { key: 'maximumSpeedOfFixedWiredInternetAccess' },
    { key: 'maximumSpeedOfFixedWirelessInternetAccess' },
    { key: 'maximumSpeedOfMobileInternetAccess' }
  ],
  '15': [
    { key: 'theAmountOfFundsReceived', count: 5 },
    { key: 'includingFundsBudgetsOfAllLevelsTotal', count: 5 },
    { key: 'includingTheBudgetOfFederal', count: 5 },
    { key: 'includingTheBudgetOfTheSubjectOfTheRussiaFederation', count: 5 },
    { key: 'localBudget', count: 5 },
    { key: 'organizations', count: 5 },
    { key: 'population', count: 5 },
    { key: 'socialFunds', count: 5 },
    { key: 'foreignSources', count: 5 },
    { key: 'balanceBeginning' },
    { key: 'balanceEnd' }
  ],
  '16': [
    { key: 'totalExpensesTotal' },
    { key: 'paymentOfLaborTotal' },
    { key: 'paymentForWorkTotal' },
    { key: 'socialSecurityTotal' },
    { key: 'otherExpensesTotal' },
    { key: 'receiptOfNonFinancialAssetsTotal' },
    { key: 'totalExpensesBudget' },
    { key: 'paymentOfLaborBudget' },
    { key: 'paymentForWorkBudget' },
    { key: 'socialSecurityBudget' },
    { key: 'otherExpensesBudget' },
    { key: 'receiptOfNonFinancialAssetsBudget' }
  ],
  '17': [
    { key: 'totalDigitalTechCostsTotal' },
    { key: 'internalDigitalTechCosts' },
    { key: 'externalDigitalTechCosts' },
    { key: 'securityProductsServices' }
  ],
  '18': [
    { key: 'internalDigitalTechCostsTotal' },
    { key: 'ownFunds' },
    { key: 'budgetFunds' },
    { key: 'otherAttractedFunds' }
  ]
}

const buildCodeMap = (sectionKey: string) => {
  const section = labelsBySection[sectionKey]
  if (!section) return {}
  const map: Record<string, string> = {}
  Object.entries(section).forEach(([label, code]) => {
    map[String(code)] = label
  })
  return map
}

const codeMapCache: Record<string, Record<string, string>> = {}

const getCodeMap = (sectionId: string) => {
  const sectionKey = sectionIdMap[sectionId] || sectionId
  if (!codeMapCache[sectionKey]) {
    codeMapCache[sectionKey] = buildCodeMap(sectionKey)
  }
  return codeMapCache[sectionKey]
}

const resolveSectionKey = (sectionId: string): string => {
  if (sectionIdMap[sectionId]) return sectionIdMap[sectionId]
  const match = sectionId.match(/\d+/)
  return match ? match[0] : sectionId
}

const getLabelKeys = (sectionKey: string): string[] => {
  const section = labelsBySection[sectionKey]
  if (!section) return []
  return Object.keys(section)
}

export const getFieldLabel = (sectionId: string, key: string): string => {
  const directMap = directFieldLabelMap[sectionId]
  if (directMap?.[key]) return directMap[key]
  const codeMap = getCodeMap(resolveSectionKey(sectionId))
  if (codeMap[key]) return codeMap[key]
  return key
}

export const mapSectionFields = (sectionId: string, data: Record<string, any>): FieldEntry[] => {
  const directMap = directFieldLabelMap[sectionId]
  if (directMap) {
    return Object.keys(directMap).map(key => ({
      key,
      label: directMap[key],
      value: data[key]
    }))
  }

  const sectionKey = resolveSectionKey(sectionId)
  const schema = sectionFieldSchema[sectionKey]
  const labelKeys = getLabelKeys(sectionKey)

  if (!schema || labelKeys.length === 0) {
    return Object.entries(data)
      .filter(([key]) => key !== 'id')
      .map(([key, value]) => ({
        key,
        label: getFieldLabel(sectionId, key),
        value
      }))
  }

  const entries: FieldEntry[] = []
  let offset = 0
  const usedKeys = new Set<string>()

  schema.forEach(def => {
    usedKeys.add(def.key)
    if (def.count) {
      const labelsSlice = labelKeys.slice(offset, offset + def.count)
      const valuesArray = Array.isArray(data[def.key]) ? (data[def.key] as unknown[]) : []
      labelsSlice.forEach((label, index) => {
        entries.push({
          key: `${def.key}.${index}`,
          label,
          value: valuesArray[index]
        })
      })
      offset += def.count
      return
    }

    const label = labelKeys[offset] || def.key
    entries.push({
      key: def.key,
      label,
      value: data[def.key]
    })
    offset += 1
  })

  Object.entries(data)
    .filter(([key]) => key !== 'id' && !usedKeys.has(key))
    .forEach(([key, value]) => {
      entries.push({
        key,
        label: getFieldLabel(sectionId, key),
        value
      })
    })

  return entries
}
