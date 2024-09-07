$Firefly.createClass("sap.firefly.XCollectionUtils", sap.firefly.XObject, {
	$statics : {
		hasElements : function(collection) {
			return (collection !== null) && collection.hasElements();
		},
		releaseEntriesFromCollection : function(collection) {
			var iterator;
			if (collection !== null) {
				iterator = collection.getIterator();
				while (iterator.hasNext()) {
					iterator.next().releaseObject();
				}
				iterator.releaseObject();
			}
		},
		releaseEntriesAndCollectionIfNotNull : function(collection) {
			var iterator;
			if (collection !== null) {
				iterator = collection.getIterator();
				while (iterator.hasNext()) {
					iterator.next().releaseObject();
				}
				iterator.releaseObject();
				collection.releaseObject();
			}
			return null;
		},
		getNameValuePairs : function(map) {
			var iterator = map.getKeysAsIteratorOfString();
			var pairsIxList = sap.firefly.XList.create();
			var name;
			var value;
			var pair;
			while (iterator.hasNext()) {
				name = iterator.next();
				value = map.getByKey(name);
				pair = sap.firefly.XNameValuePair.create();
				pair.setName(name);
				pair.setValue(value);
				pairsIxList.add(pair);
			}
			return pairsIxList.getIterator();
		},
		createListCopy : function(other) {
			var list;
			if (other === null) {
				return null;
			}
			list = sap.firefly.XList.create();
			list.addAll(other);
			return list;
		},
		sortListAsIntegers : function(list, sortDirection) {
			var sortedList = sap.firefly.XListOfString
					.createFromReadOnlyList(list);
			var comparator = new sap.firefly.XCompararorStringAsNumber();
			comparator.setup(sortDirection);
			sortedList.sortByComparator(comparator);
			return sortedList;
		}
	}
});
$Firefly
		.createClass(
				"sap.firefly.XCompararorStringAsNumber",
				sap.firefly.XObject,
				{
					m_sortDirection : null,
					setup : function(sortDirection) {
						this.m_sortDirection = sortDirection;
					},
					compare : function(o1, o2) {
						var i1 = sap.firefly.XInteger
								.convertStringToInteger(o1);
						var i2 = sap.firefly.XInteger
								.convertStringToInteger(o2);
						var result;
						if (i1 === i2) {
							return 0;
						}
						result = 1;
						if (i1 < i2) {
							result = -1;
						}
						if (this.m_sortDirection === sap.firefly.XSortDirection.DESCENDING) {
							result = result * -1;
						}
						return result;
					}
				});
$Firefly.createClass("sap.firefly.XHierarchyComparator", sap.firefly.XObject, {
	$statics : {
		create : function() {
			return new sap.firefly.XHierarchyComparator();
		}
	},
	compare : function(o1, o2) {
		var s1;
		var s2;
		if (o1.isNode()) {
			if (o2.isLeaf()) {
				return -1;
			}
		} else {
			if (o2.isNode()) {
				return 1;
			}
		}
		s1 = o1.getName();
		s2 = o2.getName();
		return sap.firefly.XString.compare(s1, s2);
	}
});
$Firefly.createClass("sap.firefly.XHierarchyResult", sap.firefly.XObject, {
	$statics : {
		create : function(parentNode, list) {
			var newObj = new sap.firefly.XHierarchyResult();
			newObj.m_list = list;
			newObj.m_parentNode = parentNode;
			return newObj;
		}
	},
	m_parentNode : null,
	m_list : null,
	getChildren : function() {
		return this.m_list;
	},
	getHierarchyParentNode : function() {
		return this.m_parentNode;
	}
});
$Firefly
		.createClass(
				"sap.firefly.PrFactory",
				sap.firefly.XObject,
				{
					$statics : {
						createListParameter : function() {
							return sap.firefly.PrList.create();
						},
						createIntegerParameter : function(number) {
							return sap.firefly.PrInteger
									.createWithValue(number);
						},
						createLongParameter : function(number) {
							return sap.firefly.PrLong.createWithValue(number);
						},
						createDoubleParameter : function(number) {
							return sap.firefly.PrDouble.createWithValue(number);
						},
						createStringParameter : function(string) {
							return sap.firefly.PrString.createWithValue(string);
						},
						createStructureParameter : function() {
							return sap.firefly.PrStructure.create();
						},
						createBooleanParameter : function(value) {
							return sap.firefly.PrBoolean.createWithValue(value);
						},
						createNullParameter : function() {
							return sap.firefly.PrNull.create();
						},
						createElementDeepCopy : function(element) {
							if (element === null) {
								return null;
							}
							return sap.firefly.PrFactory.copyElement(element);
						},
						copyElement : function(element) {
							var prElementType;
							if (element === null) {
								return null;
							}
							prElementType = element.getType();
							if (sap.firefly.PrElementType.BOOLEAN === prElementType) {
								return sap.firefly.PrFactory
										.createBooleanParameter((element)
												.getBooleanValue());
							} else {
								if (sap.firefly.PrElementType.THE_NULL === prElementType) {
									return sap.firefly.PrFactory
											.createNullParameter();
								} else {
									if (sap.firefly.PrElementType.INTEGER === prElementType) {
										return sap.firefly.PrFactory
												.createIntegerParameter(element
														.asNumber()
														.getIntegerValue());
									} else {
										if (sap.firefly.PrElementType.LONG === prElementType) {
											return sap.firefly.PrFactory
													.createLongParameter(element
															.asNumber()
															.getLongValue());
										} else {
											if (sap.firefly.PrElementType.DOUBLE === prElementType) {
												return sap.firefly.PrFactory
														.createDoubleParameter(element
																.asNumber()
																.getDoubleValue());
											} else {
												if (sap.firefly.PrElementType.STRING === prElementType) {
													return sap.firefly.PrFactory
															.createStringParameter((element)
																	.getStringValue());
												} else {
													if (sap.firefly.PrElementType.STRUCTURE === prElementType) {
														return sap.firefly.PrFactory
																.copyStructure(element);
													} else {
														if (sap.firefly.PrElementType.LIST === prElementType) {
															return sap.firefly.PrFactory
																	.copyList(element);
														}
													}
												}
											}
										}
									}
								}
							}
							throw sap.firefly.XException
									.createIllegalStateException("unknown type");
						},
						copyStructure : function(structure) {
							var structureCopy = sap.firefly.PrFactory
									.createStructureParameter();
							var structureElementNames = structure
									.getStructureElementNames();
							var structureElementNamesSize = structureElementNames
									.size();
							var i;
							var structureElementName;
							var structureElement;
							var structureElementCopy;
							for (i = 0; i < structureElementNamesSize; i++) {
								structureElementName = structureElementNames
										.get(i);
								structureElement = structure
										.getElementByName(structureElementName);
								structureElementCopy = sap.firefly.PrFactory
										.copyElement(structureElement);
								structureCopy.setElementByName(
										structureElementName,
										structureElementCopy);
							}
							return structureCopy;
						},
						copyList : function(list) {
							var listCopy = sap.firefly.PrFactory
									.createListParameter();
							var listSize = list.size();
							var i;
							var listElement;
							var listElementCopy;
							for (i = 0; i < listSize; i++) {
								listElement = list.getElementByIndex(i);
								listElementCopy = sap.firefly.PrFactory
										.copyElement(listElement);
								listCopy.add(listElementCopy);
							}
							return listCopy;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PrDeltaUtil",
				sap.firefly.XObject,
				{
					$statics : {
						getDeletions : function(originalElement, changedElement) {
							return sap.firefly.PrDeltaUtil.removeElement(
									originalElement, changedElement, false);
						},
						getAdditions : function(originalElement, changedElement) {
							return sap.firefly.PrDeltaUtil.removeElement(
									changedElement, originalElement, false);
						},
						addStructure : function(originalStructure,
								structureAdditions, overwriteDuplicatedKeys,
								tryToMerge) {
							var newStructure;
							var elementNames;
							var elementNamesIt;
							var currentNameToAddStruct;
							var elementToAdd;
							var currentElementInOrigStruct;
							if ((originalStructure !== null)
									&& (structureAdditions === null)) {
								return sap.firefly.PrStructure
										.createDeepCopy(originalStructure);
							}
							if (originalStructure === null) {
								return null;
							}
							newStructure = sap.firefly.PrStructure
									.createDeepCopy(originalStructure);
							elementNames = structureAdditions
									.getStructureElementNamesSorted();
							elementNamesIt = elementNames.getIterator();
							while (elementNamesIt.hasNext()) {
								currentNameToAddStruct = elementNamesIt.next();
								elementToAdd = structureAdditions
										.getElementByName(currentNameToAddStruct);
								currentElementInOrigStruct = newStructure
										.getElementByName(currentNameToAddStruct);
								if ((currentElementInOrigStruct !== null)) {
									if ((tryToMerge)
											&& (currentElementInOrigStruct
													.getType() === elementToAdd
													.getType())
											&& (currentElementInOrigStruct
													.isList() || currentElementInOrigStruct
													.isStructure())) {
										if (currentElementInOrigStruct
												.isStructure()) {
											elementToAdd = sap.firefly.PrDeltaUtil
													.addStructure(
															currentElementInOrigStruct,
															elementToAdd,
															overwriteDuplicatedKeys,
															tryToMerge);
											newStructure.setElementByName(
													currentNameToAddStruct,
													elementToAdd);
										} else {
											if (currentElementInOrigStruct
													.isList()) {
												elementToAdd = sap.firefly.PrDeltaUtil
														.addList(
																currentElementInOrigStruct,
																elementToAdd,
																overwriteDuplicatedKeys,
																tryToMerge);
												newStructure.setElementByName(
														currentNameToAddStruct,
														elementToAdd);
											}
										}
									} else {
										if (overwriteDuplicatedKeys) {
											newStructure.setElementByName(
													currentNameToAddStruct,
													null);
											newStructure.setElementByName(
													currentNameToAddStruct,
													elementToAdd);
										}
									}
								} else {
									newStructure.setElementByName(
											currentNameToAddStruct,
											elementToAdd);
								}
							}
							if (newStructure.hasElements()) {
								return newStructure;
							}
							return null;
						},
						mergeListOfNameObjects : function(firstList, secondList) {
							var newList;
							var usedNames;
							var element;
							var size;
							var i;
							if ((firstList === null) && (secondList === null)) {
								return sap.firefly.PrList.create();
							}
							if (firstList === null) {
								return secondList.getPermaCopy();
							}
							if (secondList === null) {
								return firstList.getPermaCopy();
							}
							newList = firstList.getPermaCopy();
							usedNames = sap.firefly.XHashSetOfString.create();
							size = firstList.size();
							for (i = 0; i < size; i++) {
								element = firstList.getStructureByIndex(i);
								usedNames.put(element.getStringByName("Name"));
							}
							size = secondList.size();
							for (i = 0; i < size; i++) {
								element = secondList.getStructureByIndex(i);
								if (!usedNames.contains(element
										.getStringByName("Name"))) {
									newList.add(element);
								}
							}
							return newList;
						},
						addList : function(originalList, listAdditions,
								overwriteDuplicatedKeysAndIndex, tryToMerge) {
							var newList;
							var i;
							var currentElementToAdd;
							var elementOnSameIndex;
							if ((originalList !== null)
									&& (listAdditions === null)) {
								return sap.firefly.PrList
										.createDeepCopy(originalList);
							}
							if (originalList === null) {
								return null;
							}
							newList = sap.firefly.PrList
									.createDeepCopy(originalList);
							for (i = 0; i < listAdditions.size(); i++) {
								currentElementToAdd = listAdditions
										.getElementByIndex(i);
								elementOnSameIndex = null;
								if ((newList.size() >= i)
										&& (!newList.isEmpty())) {
									elementOnSameIndex = newList
											.getElementByIndex(i);
								}
								if ((elementOnSameIndex !== null)) {
									if (elementOnSameIndex.isList()) {
										currentElementToAdd = sap.firefly.PrDeltaUtil
												.addList(
														elementOnSameIndex,
														currentElementToAdd,
														overwriteDuplicatedKeysAndIndex,
														tryToMerge);
									} else {
										if (elementOnSameIndex.isStructure()) {
											currentElementToAdd = sap.firefly.PrDeltaUtil
													.addStructure(
															elementOnSameIndex,
															currentElementToAdd,
															overwriteDuplicatedKeysAndIndex,
															tryToMerge);
										}
									}
									if ((currentElementToAdd
											.isEqualTo(elementOnSameIndex))
											&& (tryToMerge)) {
										newList.add(listAdditions
												.getElementByIndex(i));
									} else {
										if (overwriteDuplicatedKeysAndIndex) {
											newList.setElementAt(
													currentElementToAdd, i);
										} else {
											if (tryToMerge) {
												newList
														.add(currentElementToAdd);
											}
										}
									}
								} else {
									newList.add(currentElementToAdd);
								}
							}
							return newList;
						},
						removeElement : function(originalElement,
								elementsToRemove, identifyByKeyOnly) {
							var elementType;
							var newElement;
							if (((originalElement !== null) && (elementsToRemove === null))) {
								return originalElement.getPermaCopy();
							}
							if ((originalElement === null)) {
								return null;
							}
							if (originalElement.getType() !== elementsToRemove
									.getType()) {
								return originalElement.getPermaCopy();
							}
							elementType = originalElement.getType();
							newElement = sap.firefly.PrElement
									.deepCopyElement(originalElement);
							if (elementType === sap.firefly.PrElementType.STRUCTURE) {
								return sap.firefly.PrDeltaUtil
										.deleteFromStructure(newElement,
												elementsToRemove,
												identifyByKeyOnly);
							}
							if (elementType === sap.firefly.PrElementType.STRING) {
								return sap.firefly.PrDeltaUtil
										.deleteFromString(newElement,
												elementsToRemove);
							}
							if (elementType === sap.firefly.PrElementType.LIST) {
								return sap.firefly.PrDeltaUtil.deleteFromList(
										newElement, elementsToRemove,
										identifyByKeyOnly);
							}
							if (elementType === sap.firefly.PrElementType.BOOLEAN) {
								return sap.firefly.PrDeltaUtil
										.deleteFromBoolean(newElement,
												elementsToRemove);
							}
							if (elementType === sap.firefly.PrElementType.DOUBLE) {
								return sap.firefly.PrDeltaUtil
										.deleteFromDouble(newElement,
												elementsToRemove);
							}
							if (elementType === sap.firefly.PrElementType.INTEGER) {
								return sap.firefly.PrDeltaUtil
										.deleteFromInteger(newElement,
												elementsToRemove);
							}
							if (elementType === sap.firefly.PrElementType.LONG) {
								return sap.firefly.PrDeltaUtil.deleteFromLong(
										newElement, elementsToRemove);
							}
							return newElement;
						},
						deleteFromList : function(originalList, listDeletions,
								identifyByKeyOnly) {
							var newList = sap.firefly.PrList.create();
							var i;
							var currentElement;
							var elementToAdd;
							for (i = 0; i < originalList.size(); i++) {
								currentElement = originalList
										.getElementByIndex(i);
								elementToAdd = null;
								if (listDeletions.size() > i) {
									elementToAdd = listDeletions
											.getElementByIndex(i);
								}
								elementToAdd = sap.firefly.PrDeltaUtil
										.removeElement(currentElement,
												elementToAdd, identifyByKeyOnly);
								if (elementToAdd !== null) {
									newList.add(elementToAdd);
								}
							}
							if (!newList.isEmpty()) {
								return newList;
							}
							return null;
						},
						deleteFromStructure : function(originalStructure,
								structureDeletions, identifyByKeyOnly) {
							var newStructure = sap.firefly.PrStructure.create();
							var elementNames = originalStructure
									.getStructureElementNamesSorted();
							var elementNamesIt = elementNames.getIterator();
							var currentNameInOrigStruct;
							var currentElementInOrigStruct;
							var deletionElement;
							while (elementNamesIt.hasNext()) {
								currentNameInOrigStruct = elementNamesIt.next();
								currentElementInOrigStruct = originalStructure
										.getElementByName(currentNameInOrigStruct);
								deletionElement = structureDeletions
										.getElementByName(currentNameInOrigStruct);
								if (deletionElement !== null) {
									if ((identifyByKeyOnly)
											&& (!currentElementInOrigStruct
													.isStructure())) {
										currentElementInOrigStruct = null;
									} else {
										currentElementInOrigStruct = sap.firefly.PrDeltaUtil
												.removeElement(
														currentElementInOrigStruct,
														deletionElement,
														identifyByKeyOnly);
									}
								}
								newStructure.setElementByName(
										currentNameInOrigStruct,
										currentElementInOrigStruct);
							}
							if (newStructure.hasElements()) {
								return newStructure;
							}
							return null;
						},
						deleteFromString : function(originalString,
								changedString) {
							if (sap.firefly.XString.isEqual(originalString
									.getStringValue(), changedString
									.getStringValue())) {
								return null;
							}
							return originalString;
						},
						deleteFromDouble : function(originalDouble,
								changedDouble) {
							if (originalDouble.getDoubleValue() === changedDouble
									.getDoubleValue()) {
								return null;
							}
							return originalDouble;
						},
						deleteFromLong : function(originalLong, changedLong) {
							if (originalLong.getLongValue() === changedLong
									.getLongValue()) {
								return null;
							}
							return originalLong;
						},
						deleteFromInteger : function(originalInteger,
								changedInteger) {
							if (originalInteger.getIntegerValue() === changedInteger
									.getIntegerValue()) {
								return null;
							}
							return originalInteger;
						},
						deleteFromBoolean : function(originalBoolean,
								changedBoolean) {
							if (originalBoolean.getBooleanValue() === changedBoolean
									.getBooleanValue()) {
								return null;
							}
							return originalBoolean;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PrToString",
				sap.firefly.XObject,
				{
					$statics : {
						NEW_LINE : "\n",
						SPACE : " ",
						QUOTE : '"',
						COLON : ":",
						CURLY_BRACKET_OPEN : "{",
						CURLY_BRACKET_CLOSE : "}",
						SQUARE_BRACKET_OPEN : "[",
						SQUARE_BRACKET_CLOSE : "]",
						COMMA : ",",
						L_TRUE : "true",
						L_FALSE : "false",
						L_NULL : "null",
						serialize : function(element, sortStructureElements,
								prettyPrint, indentation) {
							var buffer = sap.firefly.XStringBuffer.create();
							sap.firefly.PrToString.appendElement(element, null,
									buffer, sortStructureElements, prettyPrint,
									indentation, 0);
							return buffer.toString();
						},
						appendIndentationString : function(buffer, indentation,
								indentationLevel) {
							var spaces;
							var i;
							if (indentation < 1) {
								return;
							}
							if (indentationLevel < 1) {
								return;
							}
							spaces = indentation * indentationLevel;
							for (i = 0; i < spaces; i++) {
								buffer.append(sap.firefly.PrToString.SPACE);
							}
						},
						appendElement : function(element, elementName, buffer,
								sortStructureElements, prettyPrint,
								indentation, indentationLevel) {
							var type;
							var stringValue;
							if (element === null) {
								buffer.append(sap.firefly.PrToString.L_NULL);
							} else {
								if (prettyPrint) {
									sap.firefly.PrToString
											.appendIndentationString(buffer,
													indentation,
													indentationLevel);
								}
								if (elementName !== null) {
									buffer.append(sap.firefly.PrToString.QUOTE);
									buffer.append(sap.firefly.XHttpUtils
											.escapeToJsonString(elementName));
									buffer.append(sap.firefly.PrToString.QUOTE);
									buffer.append(sap.firefly.PrToString.COLON);
									if (prettyPrint) {
										buffer
												.append(sap.firefly.PrToString.SPACE);
									}
								}
								type = element.getType();
								if (type === sap.firefly.PrElementType.STRUCTURE) {
									sap.firefly.PrToString.appendStructure(
											element, buffer,
											sortStructureElements, prettyPrint,
											indentation, indentationLevel);
								} else {
									if (type === sap.firefly.PrElementType.LIST) {
										sap.firefly.PrToString.appendList(
												element, buffer,
												sortStructureElements,
												prettyPrint, indentation,
												indentationLevel);
									} else {
										if (type === sap.firefly.PrElementType.STRING) {
											stringValue = (element)
													.getStringValue();
											if (stringValue === null) {
												buffer
														.append(sap.firefly.PrToString.L_NULL);
											} else {
												buffer
														.append(sap.firefly.PrToString.QUOTE);
												buffer
														.append(sap.firefly.XHttpUtils
																.escapeToJsonString(stringValue));
												buffer
														.append(sap.firefly.PrToString.QUOTE);
											}
										} else {
											if (type === sap.firefly.PrElementType.DOUBLE) {
												buffer.appendDouble(element
														.asNumber()
														.getDoubleValue());
											} else {
												if (type.isNumber()) {
													buffer.appendLong(element
															.asNumber()
															.getLongValue());
												} else {
													if (type === sap.firefly.PrElementType.BOOLEAN) {
														if ((element)
																.getBooleanValue()) {
															buffer
																	.append(sap.firefly.PrToString.L_TRUE);
														} else {
															buffer
																	.append(sap.firefly.PrToString.L_FALSE);
														}
													} else {
														if (type === sap.firefly.PrElementType.THE_NULL) {
															buffer
																	.append(sap.firefly.PrToString.L_NULL);
														}
													}
												}
											}
										}
									}
								}
							}
						},
						appendStructure : function(element, buffer,
								sortStructureElements, prettyPrint,
								indentation, indentationLevel) {
							var hasElements;
							var structure;
							var structureElementNames;
							var sortedList;
							var structureElementNamesSize;
							var i;
							var structureElementName;
							var structureElement;
							var childIndentationLevel;
							buffer
									.append(sap.firefly.PrToString.CURLY_BRACKET_OPEN);
							hasElements = false;
							structure = element;
							structureElementNames = structure
									.getStructureElementNames();
							if (structureElementNames !== null) {
								if (sortStructureElements) {
									sortedList = sap.firefly.XListOfString
											.createFromReadOnlyList(structureElementNames);
									sortedList
											.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
									structureElementNames = sortedList;
								}
								structureElementNamesSize = structureElementNames
										.size();
								for (i = 0; i < structureElementNamesSize; i++) {
									if (hasElements) {
										buffer
												.append(sap.firefly.PrToString.COMMA);
									}
									hasElements = true;
									if (prettyPrint) {
										buffer
												.append(sap.firefly.PrToString.NEW_LINE);
									}
									structureElementName = structureElementNames
											.get(i);
									structureElement = structure
											.getElementByName(structureElementName);
									childIndentationLevel = indentationLevel + 1;
									sap.firefly.PrToString.appendElement(
											structureElement,
											structureElementName, buffer,
											sortStructureElements, prettyPrint,
											indentation, childIndentationLevel);
								}
							}
							if (prettyPrint) {
								if (hasElements) {
									buffer
											.append(sap.firefly.PrToString.NEW_LINE);
									sap.firefly.PrToString
											.appendIndentationString(buffer,
													indentation,
													indentationLevel);
								}
							}
							buffer
									.append(sap.firefly.PrToString.CURLY_BRACKET_CLOSE);
						},
						appendList : function(element, buffer,
								sortStructureElements, prettyPrint,
								indentation, indentationLevel) {
							var hasElements;
							var list;
							var size;
							var i;
							var listElement;
							var childIndentationLevel;
							buffer
									.append(sap.firefly.PrToString.SQUARE_BRACKET_OPEN);
							hasElements = false;
							list = element;
							size = list.size();
							for (i = 0; i < size; i++) {
								if (hasElements) {
									buffer.append(sap.firefly.PrToString.COMMA);
								}
								hasElements = true;
								if (prettyPrint) {
									buffer
											.append(sap.firefly.PrToString.NEW_LINE);
								}
								listElement = list.getElementByIndex(i);
								childIndentationLevel = indentationLevel + 1;
								sap.firefly.PrToString.appendElement(
										listElement, null, buffer,
										sortStructureElements, prettyPrint,
										indentation, childIndentationLevel);
							}
							if (prettyPrint) {
								if (hasElements) {
									buffer
											.append(sap.firefly.PrToString.NEW_LINE);
									sap.firefly.PrToString
											.appendIndentationString(buffer,
													indentation,
													indentationLevel);
								}
							}
							buffer
									.append(sap.firefly.PrToString.SQUARE_BRACKET_CLOSE);
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PrUtils",
				sap.firefly.XObject,
				{
					$statics : {
						asStructure : function(element) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.STRUCTURE) === false) {
								return null;
							}
							return element;
						},
						asList : function(element) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.LIST) === false) {
								return null;
							}
							return element;
						},
						isListEmpty : function(list) {
							return (list === null) || list.isEmpty();
						},
						asString : function(element) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.STRING) === false) {
								return null;
							}
							return element;
						},
						asBoolean : function(element) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.BOOLEAN) === false) {
								return null;
							}
							return element;
						},
						asNull : function(element) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.THE_NULL) === false) {
								return null;
							}
							return element.asNull();
						},
						asNumber : function(element) {
							if ((sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.DOUBLE) === false)
									&& (sap.firefly.PrUtils.isElementValid(
											element,
											sap.firefly.PrElementType.INTEGER) === false)
									&& (sap.firefly.PrUtils.isElementValid(
											element,
											sap.firefly.PrElementType.LONG) === false)) {
								return null;
							}
							return element.asNumber();
						},
						asDouble : function(element) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.DOUBLE) === false) {
								return null;
							}
							return element;
						},
						asInteger : function(element) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.INTEGER) === false) {
								return null;
							}
							return element;
						},
						asLong : function(element) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.LONG) === false) {
								return null;
							}
							return element;
						},
						copyIntegerValues : function(parameterList,
								existingArray) {
							var size = parameterList.size();
							var localArray;
							var i;
							if ((existingArray === null)
									|| (existingArray.size() !== size)) {
								localArray = sap.firefly.XArrayOfInt
										.create(size);
							} else {
								localArray = existingArray;
							}
							for (i = 0; i < size; i++) {
								localArray.set(i, parameterList
										.getIntegerByIndex(i));
							}
							return localArray;
						},
						getProperty : function(structure, name) {
							if ((structure === null) || (name === null)) {
								return null;
							}
							return structure.getElementByName(name);
						},
						isElementValid : function(element, type) {
							if (element === null) {
								return false;
							}
							return element.getType() === type;
						},
						getStructureProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.STRUCTURE) === false) {
								return null;
							}
							return element;
						},
						getListProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.LIST) === false) {
								return null;
							}
							return element;
						},
						getStringProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToString(element);
						},
						getStringValueProperty : function(structure, name,
								defaultValue) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToStringValue(element,
											defaultValue);
						},
						getBooleanProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToBoolean(element);
						},
						getBooleanValueProperty : function(structure, name,
								defaultValue) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToBooleanValue(element,
											defaultValue);
						},
						getNumberProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToNumber(element);
						},
						getIntegerProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToInteger(element);
						},
						getIntegerValueProperty : function(structure, name,
								defaultValue) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToIntegerValue(element,
											defaultValue);
						},
						getDoubleProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToDouble(element);
						},
						getDoubleValueProperty : function(structure, name,
								defaultValue) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToDoubleValue(element,
											defaultValue);
						},
						getLongProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToLong(element);
						},
						getLongValueProperty : function(structure, name,
								defaultValue) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							return sap.firefly.PrUtils
									.convertElementToLongValue(element,
											defaultValue);
						},
						getNullProperty : function(structure, name) {
							var element = sap.firefly.PrUtils.getProperty(
									structure, name);
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.THE_NULL) === false) {
								return null;
							}
							return element.asNull();
						},
						getDateValueProperty : function(structure, name,
								isSapFormat, defaultValue) {
							var stringProperty = sap.firefly.PrUtils
									.getStringProperty(structure, name);
							var result;
							if (stringProperty === null) {
								return defaultValue;
							}
							result = sap.firefly.XDate
									.createDateFromStringWithFlag(
											stringProperty.getStringValue(),
											isSapFormat);
							if (result === null) {
								return defaultValue;
							}
							return result;
						},
						getTimeValueProperty : function(structure, name,
								isSapFormat, defaultValue) {
							var stringProperty = sap.firefly.PrUtils
									.getStringProperty(structure, name);
							var result;
							if (stringProperty === null) {
								return defaultValue;
							}
							result = sap.firefly.XTime
									.createTimeFromStringWithFlag(
											stringProperty.getStringValue(),
											isSapFormat);
							if (result === null) {
								return defaultValue;
							}
							return result;
						},
						getDateTimeValueProperty : function(structure, name,
								isSapFormat, defaultValue) {
							var stringProperty = sap.firefly.PrUtils
									.getStringProperty(structure, name);
							var result;
							if (stringProperty === null) {
								return defaultValue;
							}
							result = sap.firefly.XDateTime
									.createDateTimeFromStringWithFlag(
											stringProperty.getStringValue(),
											isSapFormat);
							if (result === null) {
								return defaultValue;
							}
							return result;
						},
						getElement : function(list, index) {
							if (list === null) {
								return null;
							}
							if ((index < 0) || (index >= list.size())) {
								return null;
							}
							return list.getElementByIndex(index);
						},
						getStructureElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.STRUCTURE) === false) {
								return null;
							}
							return element;
						},
						getListElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.LIST) === false) {
								return null;
							}
							return element;
						},
						getStringElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToString(element);
						},
						getStringValueElement : function(list, index,
								defaultValue) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToStringValue(element,
											defaultValue);
						},
						getBooleanElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToBoolean(element);
						},
						getBooleanValueElement : function(list, index,
								defaultValue) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToBooleanValue(element,
											defaultValue);
						},
						getNumberElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToNumber(element);
						},
						getIntegerElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToInteger(element);
						},
						getIntegerValueElement : function(list, index,
								defaultValue) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToIntegerValue(element,
											defaultValue);
						},
						getDoubleElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToDouble(element);
						},
						getDoubleValueElement : function(list, index,
								defaultValue) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToDoubleValue(element,
											defaultValue);
						},
						getLongElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToLong(element);
						},
						getLongValueElement : function(list, index,
								defaultValue) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							return sap.firefly.PrUtils
									.convertElementToLongValue(element,
											defaultValue);
						},
						getNullElement : function(list, index) {
							var element = sap.firefly.PrUtils.getElement(list,
									index);
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.THE_NULL) === false) {
								return null;
							}
							return element.asNull();
						},
						getDateValueElement : function(list, index,
								isSapFormat, defaultValue) {
							var stringElement = sap.firefly.PrUtils
									.getStringElement(list, index);
							var result;
							if (stringElement === null) {
								return defaultValue;
							}
							result = sap.firefly.XDate
									.createDateFromStringWithFlag(stringElement
											.getStringValue(), isSapFormat);
							if (result === null) {
								return defaultValue;
							}
							return result;
						},
						getTimeValueElement : function(list, index,
								isSapFormat, defaultValue) {
							var stringElement = sap.firefly.PrUtils
									.getStringElement(list, index);
							var result;
							if (stringElement === null) {
								return defaultValue;
							}
							result = sap.firefly.XTime
									.createTimeFromStringWithFlag(stringElement
											.getStringValue(), isSapFormat);
							if (result === null) {
								return defaultValue;
							}
							return result;
						},
						getDateTimeValueElement : function(list, index,
								isSapFormat, defaultValue) {
							var stringElement = sap.firefly.PrUtils
									.getStringElement(list, index);
							var result;
							if (stringElement === null) {
								return defaultValue;
							}
							result = sap.firefly.XDateTime
									.createDateTimeFromStringWithFlag(
											stringElement.getStringValue(),
											isSapFormat);
							if (result === null) {
								return defaultValue;
							}
							return result;
						},
						convertIntegerToString : function(element) {
							var integerElement = element;
							try {
								return sap.firefly.XInteger
										.convertIntegerToString(integerElement
												.getIntegerValue());
							} catch (t) {
								return null;
							}
						},
						convertDoubleToString : function(element) {
							var doubleElement = element;
							try {
								return sap.firefly.XDouble
										.convertDoubleToString(doubleElement
												.getDoubleValue());
							} catch (t) {
								return null;
							}
						},
						convertLongToString : function(element) {
							var longElement = element;
							try {
								return sap.firefly.XLong
										.convertLongToString(longElement
												.getLongValue());
							} catch (t) {
								return null;
							}
						},
						convertBoolToString : function(element) {
							var booleanElement = element;
							try {
								return sap.firefly.XBoolean
										.convertBooleanToString(booleanElement
												.getBooleanValue());
							} catch (t) {
								return null;
							}
						},
						convertElementToString : function(element) {
							var elementType;
							var stringValue;
							if (element === null) {
								return null;
							}
							elementType = element.getType();
							if (elementType === null) {
								return null;
							}
							stringValue = null;
							if (elementType === sap.firefly.PrElementType.STRING) {
								return element;
							} else {
								if (elementType === sap.firefly.PrElementType.BOOLEAN) {
									stringValue = sap.firefly.PrUtils
											.convertBoolToString(element);
								} else {
									if (elementType === sap.firefly.PrElementType.INTEGER) {
										stringValue = sap.firefly.PrUtils
												.convertIntegerToString(element);
									} else {
										if (elementType === sap.firefly.PrElementType.DOUBLE) {
											stringValue = sap.firefly.PrUtils
													.convertDoubleToString(element);
										} else {
											if (elementType === sap.firefly.PrElementType.LONG) {
												stringValue = sap.firefly.PrUtils
														.convertLongToString(element);
											} else {
												if (elementType === sap.firefly.PrElementType.THE_NULL) {
													stringValue = sap.firefly.ConstantValue.THE_NULL
															.toString();
												}
											}
										}
									}
								}
							}
							if (stringValue === null) {
								return null;
							}
							return sap.firefly.PrString
									.createWithValue(stringValue);
						},
						convertElementToStringValue : function(element,
								defaultValue) {
							var prString;
							if (element === null) {
								return defaultValue;
							}
							prString = sap.firefly.PrUtils
									.convertElementToString(element);
							if (prString === null) {
								return defaultValue;
							}
							return prString.getStringValue();
						},
						convertElementToBoolean : function(element) {
							var elementType;
							var booleanValue;
							if (element === null) {
								return null;
							}
							elementType = element.getType();
							if (elementType === null) {
								return null;
							}
							booleanValue = false;
							if (elementType === sap.firefly.PrElementType.BOOLEAN) {
								return element;
							}
							if (elementType === sap.firefly.PrElementType.STRING) {
								try {
									booleanValue = sap.firefly.XBoolean
											.convertStringToBoolean((element)
													.getStringValue());
								} catch (t) {
									return null;
								}
								return sap.firefly.PrBoolean
										.createWithValue(booleanValue);
							}
							return null;
						},
						convertElementToBooleanValue : function(element,
								defaultValue) {
							var elementAsBoolean = sap.firefly.PrUtils
									.convertElementToBoolean(element);
							if (elementAsBoolean === null) {
								return defaultValue;
							}
							return elementAsBoolean.getBooleanValue();
						},
						convertElementToNumber : function(element) {
							var elementType = element.getType();
							var doubleValue;
							if (elementType === null) {
								return null;
							}
							if (elementType === sap.firefly.PrElementType.STRING) {
								try {
									doubleValue = sap.firefly.XDouble
											.convertStringToDouble((element)
													.getStringValue());
									return sap.firefly.PrDouble
											.createWithValue(doubleValue);
								} catch (t) {
									return null;
								}
							}
							if (elementType.isNumber()) {
								return element.asNumber();
							}
							return null;
						},
						convertElementToInteger : function(element) {
							var elementType;
							var integerValue;
							if (element === null) {
								return null;
							}
							elementType = element.getType();
							if (elementType === null) {
								return null;
							}
							if (elementType === sap.firefly.PrElementType.INTEGER) {
								return element;
							}
							if (elementType.isNumber()) {
								try {
									return sap.firefly.PrInteger
											.createWithValue(element.asNumber()
													.getIntegerValue());
								} catch (t2) {
									return null;
								}
							}
							if (elementType === sap.firefly.PrElementType.STRING) {
								try {
									integerValue = sap.firefly.XInteger
											.convertStringToIntegerWithRadix(
													(element).getStringValue(),
													10);
									return sap.firefly.PrInteger
											.createWithValue(integerValue);
								} catch (t1) {
									return null;
								}
							}
							return null;
						},
						convertElementToIntegerValue : function(element,
								defaultValue) {
							var elementAsInteger = sap.firefly.PrUtils
									.convertElementToInteger(element);
							if (elementAsInteger === null) {
								return defaultValue;
							}
							return elementAsInteger.getIntegerValue();
						},
						convertElementToLong : function(element) {
							var elementType;
							var longValue;
							if (element === null) {
								return null;
							}
							elementType = element.getType();
							if (elementType === null) {
								return null;
							}
							if (elementType === sap.firefly.PrElementType.LONG) {
								return element;
							}
							if (elementType.isNumber()) {
								try {
									return sap.firefly.PrLong
											.createWithValue(element.asNumber()
													.getLongValue());
								} catch (t2) {
									return null;
								}
							}
							if (elementType === sap.firefly.PrElementType.STRING) {
								try {
									longValue = sap.firefly.XLong
											.convertStringToLong((element)
													.getStringValue());
									return sap.firefly.PrLong
											.createWithValue(longValue);
								} catch (t1) {
									return null;
								}
							}
							return null;
						},
						convertElementToLongValue : function(element,
								defaultValue) {
							var elementAsLong = sap.firefly.PrUtils
									.convertElementToLong(element);
							if (elementAsLong === null) {
								return defaultValue;
							}
							return elementAsLong.getLongValue();
						},
						convertElementToDouble : function(element) {
							var elementType;
							var doubleValue;
							if (element === null) {
								return null;
							}
							elementType = element.getType();
							if (elementType === null) {
								return null;
							}
							if (elementType === sap.firefly.PrElementType.DOUBLE) {
								return element;
							}
							if (elementType.isNumber()) {
								try {
									return sap.firefly.PrDouble
											.createWithValue(element.asNumber()
													.getDoubleValue());
								} catch (t2) {
									return null;
								}
							}
							if (elementType === sap.firefly.PrElementType.STRING) {
								try {
									doubleValue = sap.firefly.XDouble
											.convertStringToDouble((element)
													.getStringValue());
									return sap.firefly.PrDouble
											.createWithValue(doubleValue);
								} catch (t1) {
									return null;
								}
							}
							return null;
						},
						convertElementToDoubleValue : function(element,
								defaultValue) {
							var elementAsDouble = sap.firefly.PrUtils
									.convertElementToDouble(element);
							if (elementAsDouble === null) {
								return defaultValue;
							}
							return elementAsDouble.getDoubleValue();
						},
						getListSize : function(element, defaultSize) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.LIST) === false) {
								return defaultSize;
							}
							return (element).size();
						},
						getStructureElementNames : function(element,
								defaultNames) {
							if (sap.firefly.PrUtils.isElementValid(element,
									sap.firefly.PrElementType.STRUCTURE) === false) {
								return defaultNames;
							}
							return (element).getStructureElementNames();
						},
						getStructureSize : function(element, defaultSize) {
							var elementNames = sap.firefly.PrUtils
									.getStructureElementNames(element, null);
							if (elementNames === null) {
								return defaultSize;
							}
							return elementNames.size();
						},
						createDeepCopy : function(element) {
							var elementType;
							if (element === null) {
								return null;
							}
							elementType = element.getType();
							if (elementType === null) {
								return null;
							}
							if (elementType === sap.firefly.PrElementType.STRUCTURE) {
								return sap.firefly.PrStructure
										.createDeepCopy(element);
							}
							if (elementType === sap.firefly.PrElementType.LIST) {
								return sap.firefly.PrList
										.createDeepCopy(element);
							}
							if (elementType === sap.firefly.PrElementType.THE_NULL) {
								return sap.firefly.PrNull.create();
							}
							if ((elementType === sap.firefly.PrElementType.ANY)
									|| (elementType === sap.firefly.PrElementType.OBJECT)) {
								return null;
							}
							return element.getPermaCopy();
						},
						setStringIfNotNull : function(structure, name, value) {
							if (value !== null) {
								structure.setStringByName(name, value);
							}
						},
						removeProperty : function(structure, name) {
							if (structure === null) {
								return;
							}
							if (sap.firefly.PrUtils
									.getProperty(structure, name) !== null) {
								structure.setElementByName(name, null);
							}
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XEnvironment",
				sap.firefly.XObject,
				{
					$statics : {
						s_addedEnvironmentProperties : null,
						s_removedEnvironmentProperties : null,
						staticSetup : function() {
							sap.firefly.XEnvironment.s_addedEnvironmentProperties = sap.firefly.XHashMapOfStringByString
									.create();
							sap.firefly.XEnvironment.s_removedEnvironmentProperties = sap.firefly.XHashMapOfStringByString
									.create();
						},
						setVariable : function(name, value) {
							var lowerCaseName;
							if ((name !== null) && (value !== null)) {
								lowerCaseName = sap.firefly.XString
										.convertToLowerCase(name);
								sap.firefly.XEnvironment.s_addedEnvironmentProperties
										.put(lowerCaseName, value);
								sap.firefly.XEnvironment.s_removedEnvironmentProperties
										.remove(lowerCaseName);
							}
						},
						removeVariable : function(name) {
							var lowerCaseName;
							if (name !== null) {
								lowerCaseName = sap.firefly.XString
										.convertToLowerCase(name);
								sap.firefly.XEnvironment.s_removedEnvironmentProperties
										.put(lowerCaseName, lowerCaseName);
								sap.firefly.XEnvironment.s_addedEnvironmentProperties
										.remove(lowerCaseName);
							}
						},
						getVariable : function(name) {
							var variables = sap.firefly.XEnvironment
									.getVariables();
							return variables.getByKey(name);
						},
						getVariables : function() {
							var map = null;
							var environment;
							var iterator;
							var key;
							var lowerCaseKey;
							if (sap.firefly.XEnvironment.s_addedEnvironmentProperties !== null) {
								map = sap.firefly.XHashMapOfStringByString
										.createMapOfStringByStringStaticCopy(sap.firefly.XEnvironment.s_addedEnvironmentProperties);
							} else {
								map = sap.firefly.XHashMapOfStringByString
										.create();
							}
							environment = sap.firefly.XSystemUtils
									.getNativeEnvironment();
							iterator = environment.getKeysAsIteratorOfString();
							while (iterator.hasNext()) {
								key = iterator.next();
								if (sap.firefly.XStringUtils.isNullOrEmpty(key)) {
									continue;
								}
								lowerCaseKey = sap.firefly.XString
										.convertToLowerCase(key);
								if (sap.firefly.XEnvironment.s_removedEnvironmentProperties !== null) {
									if (sap.firefly.XEnvironment.s_removedEnvironmentProperties
											.containsKey(lowerCaseKey)) {
										continue;
									}
								}
								if (map.contains(lowerCaseKey)) {
									continue;
								}
								map
										.put(lowerCaseKey, environment
												.getByKey(key));
							}
							return map;
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XNumberFormatter",
				sap.firefly.XObject,
				{
					$statics : {
						asciiTable : "!\"#$%&'()*+,-./0123456789:;<=>?",
						digit : 35,
						zeroInAbsence : 48,
						charDot : 46,
						charComma : 44,
						negativePrefix : 45,
						positivePrefix : 43,
						formatDoubleToString : function(value, format) {
							var prefixSign = 0;
							var zeroInAbsenceLeft = 0;
							var zeroInAbsenceRight = 0;
							var digitsRight = 0;
							var digitsLeft = 0;
							var isRight = false;
							var thousandSeparators = 0;
							var i;
							var currentChar;
							var hasGroupingSeparator;
							var localValue;
							var valueString;
							var leftExpressionSb;
							var rightExpression;
							var y;
							var currentChar1;
							var currentCharString;
							var leftExpressionLength;
							var rightExpressionLength;
							var roundingRequired;
							var lastDigit;
							var roundingBase;
							var totalCount;
							var z;
							var firstRightDigit;
							var leftExpression;
							var tmp;
							var a;
							var result;
							var mod;
							var b;
							var currentChar2;
							for (i = 0; i < sap.firefly.XString.size(format); i++) {
								currentChar = sap.firefly.XString.getCharAt(
										format, i);
								if ((currentChar === sap.firefly.XNumberFormatter.negativePrefix)
										|| (currentChar === sap.firefly.XNumberFormatter.positivePrefix)) {
									prefixSign = currentChar;
								}
								if ((currentChar === sap.firefly.XNumberFormatter.digit)
										|| (currentChar === sap.firefly.XNumberFormatter.zeroInAbsence)) {
									if (isRight) {
										digitsRight++;
									} else {
										digitsLeft++;
									}
								}
								if (currentChar === sap.firefly.XNumberFormatter.zeroInAbsence) {
									if (isRight) {
										zeroInAbsenceRight++;
									} else {
										zeroInAbsenceLeft++;
									}
								}
								if (currentChar === sap.firefly.XNumberFormatter.charDot) {
									isRight = true;
								}
								if (currentChar === sap.firefly.XNumberFormatter.charComma) {
									thousandSeparators++;
								}
							}
							hasGroupingSeparator = digitsLeft > 1;
							if ((digitsLeft === 1) && (thousandSeparators > 0)) {
								localValue = value
										/ sap.firefly.XNumberFormatter
												.calculateExp(1000,
														thousandSeparators);
							} else {
								localValue = value;
							}
							valueString = sap.firefly.XNumberFormatter
									.normalizeScientificFormat(
											sap.firefly.XDouble
													.convertDoubleToString(localValue),
											sap.firefly.XNumberFormatter.charDot);
							leftExpressionSb = sap.firefly.XStringBuffer
									.create();
							rightExpression = "";
							isRight = false;
							for (y = 0; y < sap.firefly.XString
									.size(valueString); y++) {
								currentChar1 = sap.firefly.XString.getCharAt(
										valueString, y);
								if (currentChar1 === prefixSign) {
									continue;
								}
								if (currentChar1 === sap.firefly.XNumberFormatter.charDot) {
									isRight = true;
								} else {
									currentCharString = sap.firefly.XNumberFormatter
											.convertAsciiToString(currentChar1);
									if (isRight) {
										rightExpression = sap.firefly.XString
												.concatenate2(rightExpression,
														currentCharString);
									} else {
										leftExpressionSb
												.append(currentCharString);
									}
								}
							}
							leftExpressionLength = leftExpressionSb.length();
							rightExpressionLength = sap.firefly.XString
									.size(rightExpression);
							roundingRequired = false;
							if (digitsRight > 0) {
								if (rightExpressionLength > digitsRight) {
									lastDigit = sap.firefly.XNumberFormatter
											.charToInt(sap.firefly.XString
													.getCharAt(rightExpression,
															digitsRight - 1));
									roundingBase = sap.firefly.XNumberFormatter
											.charToInt(sap.firefly.XString
													.getCharAt(rightExpression,
															digitsRight));
									rightExpression = sap.firefly.XString
											.substring(rightExpression, 0,
													digitsRight - 1);
									rightExpression = sap.firefly.XString
											.concatenate2(
													rightExpression,
													sap.firefly.XInteger
															.convertIntegerToString(lastDigit));
									roundingRequired = roundingBase >= 5;
								}
								if ((rightExpressionLength < digitsRight)
										&& (zeroInAbsenceRight > 0)) {
									totalCount = digitsRight
											- rightExpressionLength;
									for (z = 0; z < totalCount; z++) {
										rightExpression = sap.firefly.XString
												.concatenate2(rightExpression,
														"0");
									}
								}
							} else {
								firstRightDigit = sap.firefly.XNumberFormatter
										.charToInt(sap.firefly.XString
												.getCharAt(rightExpression, 0));
								roundingRequired = firstRightDigit >= 5;
								rightExpression = "";
							}
							rightExpressionLength = sap.firefly.XString
									.size(rightExpression);
							leftExpression = leftExpressionSb.toString();
							leftExpressionSb.releaseObject();
							if (zeroInAbsenceLeft > 0) {
								tmp = sap.firefly.XStringBuffer.create();
								for (a = 0; a < (digitsLeft - leftExpressionLength); a++) {
									tmp.append("0");
								}
								tmp.append(leftExpression);
								leftExpression = tmp.toString();
								tmp.releaseObject();
							}
							leftExpressionLength = sap.firefly.XString
									.size(leftExpression);
							result = sap.firefly.XStringBuffer.create();
							if (prefixSign !== 0) {
								result.append(sap.firefly.XNumberFormatter
										.convertAsciiToString(prefixSign));
							}
							mod = sap.firefly.XMath
									.mod(leftExpressionLength, 3);
							for (b = 0; b < leftExpressionLength; b++) {
								currentChar2 = sap.firefly.XString.getCharAt(
										leftExpression, b);
								if (hasGroupingSeparator) {
									if ((b > 0)
											&& (sap.firefly.XMath.mod(b, 3) === mod)) {
										result
												.append(sap.firefly.XNumberFormatter
														.convertAsciiToString(sap.firefly.XNumberFormatter.charComma));
									}
								}
								result.append(sap.firefly.XNumberFormatter
										.convertAsciiToString(currentChar2));
							}
							if (rightExpressionLength > 0) {
								result
										.append(sap.firefly.XNumberFormatter
												.convertAsciiToString(sap.firefly.XNumberFormatter.charDot));
							}
							result.append(rightExpression);
							if (roundingRequired) {
								return sap.firefly.XNumberFormatter.round(
										result.toString(),
										sap.firefly.XNumberFormatter.charDot,
										sap.firefly.XNumberFormatter.charComma);
							}
							return result.toString();
						},
						charToInt : function(value) {
							return value - 48;
						},
						calculateExp : function(base, exponent) {
							var result = base;
							var i;
							for (i = 1; i < exponent; i++) {
								result = result * result;
							}
							return result;
						},
						normalizeScientificFormatString : function(value,
								decimalSeparator) {
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(value)
									&& sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(decimalSeparator)) {
								if (sap.firefly.XString.isEqual(
										decimalSeparator, ".")) {
									return sap.firefly.XNumberFormatter
											.normalizeScientificFormat(
													value,
													sap.firefly.XNumberFormatter.charDot);
								} else {
									if (sap.firefly.XString.isEqual(
											decimalSeparator, ",")) {
										return sap.firefly.XNumberFormatter
												.normalizeScientificFormat(
														value,
														sap.firefly.XNumberFormatter.charComma);
									}
								}
							}
							return null;
						},
						stripCharsFromNumber : function(value,
								decimalSeparator, expIdx) {
							var cleanedValue = sap.firefly.XString.substring(
									value, 0, expIdx);
							var decSep = sap.firefly.XNumberFormatter
									.convertAsciiToString(decimalSeparator);
							var decSepIdx = sap.firefly.XString.indexOf(
									cleanedValue, decSep);
							var currentValueStrSize;
							var j;
							var currentChar;
							if (decSepIdx > -1) {
								currentValueStrSize = sap.firefly.XString
										.size(cleanedValue);
								for (j = currentValueStrSize - 1; j >= decSepIdx; j--) {
									currentChar = sap.firefly.XNumberFormatter
											.convertAsciiToString(sap.firefly.XString
													.getCharAt(cleanedValue, j));
									if (sap.firefly.XString.isEqual(
											currentChar, "0")) {
										cleanedValue = sap.firefly.XString
												.substring(cleanedValue, 0, j);
									} else {
										break;
									}
								}
							}
							cleanedValue = sap.firefly.XString.replace(
									cleanedValue, decSep, "");
							return sap.firefly.XString.replace(cleanedValue,
									"-", "");
						},
						normalizeScientificFormat : function(value,
								decimalSeparator) {
							var patternString = "e";
							var expIdx = sap.firefly.XString.indexOf(value,
									patternString);
							var cleanedValue;
							var tokenizedString;
							var i;
							var charToAdd;
							var expStrValue;
							var expValue;
							var decSep;
							var currentDecSepPos;
							var newDecSepPos;
							var newStringValue;
							var n;
							if (expIdx === -1) {
								patternString = "E";
								expIdx = sap.firefly.XString.indexOf(value,
										patternString);
							}
							if (expIdx === -1) {
								return value;
							}
							cleanedValue = sap.firefly.XNumberFormatter
									.stripCharsFromNumber(value,
											decimalSeparator, expIdx);
							tokenizedString = sap.firefly.XListOfString
									.create();
							for (i = 0; i < sap.firefly.XString
									.size(cleanedValue); i++) {
								charToAdd = sap.firefly.XNumberFormatter
										.convertAsciiToString(sap.firefly.XString
												.getCharAt(cleanedValue, i));
								tokenizedString.add(charToAdd);
							}
							expStrValue = sap.firefly.XString.substring(value,
									expIdx, sap.firefly.XString.size(value));
							expValue = sap.firefly.XInteger
									.convertStringToIntegerWithRadix(
											sap.firefly.XString.replace(
													expStrValue, patternString,
													""), 10);
							decSep = sap.firefly.XNumberFormatter
									.convertAsciiToString(decimalSeparator);
							currentDecSepPos = sap.firefly.XString
									.indexOf(sap.firefly.XString.replace(value,
											"-", ""), decSep);
							if (currentDecSepPos === -1) {
								currentDecSepPos = 1;
							}
							newDecSepPos = (currentDecSepPos + expValue);
							if (expValue >= 0) {
								while (newDecSepPos > tokenizedString.size()) {
									tokenizedString.add("0");
								}
							} else {
								while ((sap.firefly.XString.size(cleanedValue) + (expValue * -1)) > tokenizedString
										.size()) {
									tokenizedString.insert(0, "0");
								}
								newDecSepPos = currentDecSepPos + expValue;
								if (newDecSepPos < 0) {
									newDecSepPos = 1;
								}
							}
							if (newDecSepPos < (tokenizedString.size() - 1)) {
								tokenizedString.insert(newDecSepPos, decSep);
							}
							if (sap.firefly.XString.startsWith(value, "-")) {
								tokenizedString.insert(0, "-");
							}
							newStringValue = sap.firefly.XStringBuffer.create();
							for (n = 0; n < tokenizedString.size(); n++) {
								newStringValue.append(tokenizedString.get(n));
							}
							return newStringValue.toString();
						},
						convertAsciiToString : function(value) {
							return sap.firefly.XString.substring(
									sap.firefly.XNumberFormatter.asciiTable,
									value - 33, value - 32);
						},
						round : function(value, decimalSeparator,
								groupingSeparator) {
							var result = sap.firefly.XStringBuffer.create();
							var rest = 1;
							var i;
							var currentChar;
							var charInt;
							var resultString;
							var length;
							var returnValue;
							var y;
							var currentChar1;
							for (i = sap.firefly.XString.size(value) - 1; i >= 0; i--) {
								currentChar = sap.firefly.XString.getCharAt(
										value, i);
								if ((currentChar === decimalSeparator)
										|| (currentChar === groupingSeparator)
										|| (currentChar === 45)
										|| (currentChar === 43)) {
									result.append(sap.firefly.XNumberFormatter
											.convertAsciiToString(currentChar));
									continue;
								}
								charInt = sap.firefly.XNumberFormatter
										.charToInt(currentChar);
								if (rest === 1) {
									charInt++;
								}
								if ((charInt > 9)) {
									charInt = 0;
									rest = 1;
								} else {
									rest = 0;
								}
								result.appendInt(charInt);
								if ((i === 0) && (rest === 1)) {
									result.append("1");
								}
							}
							resultString = result.toString();
							length = result.length();
							result.releaseObject();
							returnValue = sap.firefly.XStringBuffer.create();
							for (y = length - 1; y >= 0; y--) {
								currentChar1 = sap.firefly.XNumberFormatter
										.convertAsciiToString(sap.firefly.XString
												.getCharAt(resultString, y));
								returnValue.append(currentChar1);
							}
							return returnValue.toString();
						}
					}
				});
$Firefly.createClass("sap.firefly.XGeometryValue", sap.firefly.XObject, {
	$statics : {
		createGeometryValueWithWkt : function(wkt) {
			var point = sap.firefly.XPointValue.createWithWkt(wkt);
			var multiPoint;
			var polygon;
			var multiPolygon;
			var lineString;
			var multiLineString;
			if (point !== null) {
				return point;
			}
			multiPoint = sap.firefly.XMultiPointValue.createWithWkt(wkt);
			if (multiPoint !== null) {
				return multiPoint;
			}
			polygon = sap.firefly.XPolygonValue.createWithWkt(wkt);
			if (polygon !== null) {
				return polygon;
			}
			multiPolygon = sap.firefly.XMultiPolygonValue.createWithWkt(wkt);
			if (multiPolygon !== null) {
				return multiPolygon;
			}
			lineString = sap.firefly.XLineStringValue.createWithWkt(wkt);
			if (lineString !== null) {
				return lineString;
			}
			multiLineString = sap.firefly.XMultiLineStringValue
					.createWithWkt(wkt);
			if (multiLineString !== null) {
				return multiLineString;
			}
			return null;
		}
	}
});
$Firefly.createClass("sap.firefly.XJson", sap.firefly.XObject, {
	$statics : {
		s_extractor : null,
		extractJsonContent : function(jsonObject) {
			var element = null;
			var xjson;
			if (jsonObject !== null) {
				if (sap.firefly.XJson.s_extractor !== null) {
					element = sap.firefly.XJson.s_extractor
							.extractJsonContent(jsonObject);
				} else {
					xjson = jsonObject;
					element = xjson.getElement();
				}
			}
			return element;
		},
		setJsonExtractor : function(extractor) {
			sap.firefly.XJson.s_extractor = extractor;
		}
	},
	getElement : function() {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	toString : function() {
		return this.getElement().toString();
	}
});
$Firefly
		.createClass(
				"sap.firefly.Dispatcher",
				sap.firefly.XObject,
				{
					$statics : {
						s_singleton : null,
						staticSetup : function() {
							sap.firefly.Dispatcher.s_singleton = sap.firefly.DispatcherSingleThread
									.create();
						},
						getInstance : function() {
							return sap.firefly.Dispatcher.s_singleton;
						},
						setInstance : function(dispatcher) {
							sap.firefly.Dispatcher.s_singleton = dispatcher;
						},
						replaceInstance : function(dispatcher) {
							var oldDispatcher = sap.firefly.Dispatcher
									.getInstance();
							if (oldDispatcher !== null) {
								oldDispatcher.releaseObject();
							}
							sap.firefly.Dispatcher.setInstance(dispatcher);
						}
					}
				});
$Firefly.createClass("sap.firefly.ListenerPair", sap.firefly.XObject, {
	$statics : {
		create : function(listener, customIdentifier) {
			var element = new sap.firefly.ListenerPair();
			element.setup(listener, customIdentifier);
			return element;
		}
	},
	m_listenerWeakReference : null,
	m_customIdentifier : null,
	setup : function(listener, customIdentifier) {
		this.m_listenerWeakReference = sap.firefly.XWeakReferenceUtil
				.getWeakRef(listener);
		this.m_customIdentifier = customIdentifier;
	},
	releaseObject : function() {
		this.m_listenerWeakReference = null;
		this.m_customIdentifier = null;
		sap.firefly.ListenerPair.$superclass.releaseObject.call(this);
	},
	getListener : function() {
		return sap.firefly.XWeakReferenceUtil
				.getHardRef(this.m_listenerWeakReference);
	},
	hasWeakReference : function() {
		return this.m_listenerWeakReference !== null;
	},
	getCustomIdentifier : function() {
		return this.m_customIdentifier;
	},
	setCustomIdentifier : function(customIdentifier) {
		this.m_customIdentifier = customIdentifier;
	},
	toString : function() {
		if (this.m_listenerWeakReference === null) {
			return "[Empty]";
		}
		return this.m_listenerWeakReference.toString();
	}
});
$Firefly.createClass("sap.firefly.DfSessionContext", sap.firefly.XObject, {
	m_session : null,
	releaseObject : function() {
		this.m_session = null;
		sap.firefly.DfSessionContext.$superclass.releaseObject.call(this);
	},
	setupSessionContext : function(session) {
		this.m_session = sap.firefly.XWeakReferenceUtil.getWeakRef(session);
	},
	getSession : function() {
		return sap.firefly.XWeakReferenceUtil.getHardRef(this.m_session);
	}
});
$Firefly
		.createClass(
				"sap.firefly.SyncActionListenerPair",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(listener, type, customIdentifier) {
							var pair;
							if (listener === null) {
								throw sap.firefly.XException
										.createIllegalArgumentException("Listener is null!");
							}
							pair = new sap.firefly.SyncActionListenerPair();
							pair.setup(listener, type, customIdentifier);
							return pair;
						}
					},
					m_listener : null,
					m_customIdentifier : null,
					m_type : null,
					setup : function(listener, type, customIdentifier) {
						this.m_listener = listener;
						this.m_type = type;
						this.m_customIdentifier = customIdentifier;
					},
					releaseObject : function() {
						this.m_customIdentifier = null;
						this.m_listener = null;
						sap.firefly.SyncActionListenerPair.$superclass.releaseObject
								.call(this);
					},
					getListener : function() {
						return this.m_listener;
					},
					getListenerType : function() {
						return this.m_type;
					},
					getCustomIdentifier : function() {
						return this.m_customIdentifier;
					}
				});
$Firefly.createClass("sap.firefly.TimerItem", sap.firefly.XObject, {
	$statics : {
		create : function(milliseconds, listener, customIdentifier) {
			var object = new sap.firefly.TimerItem();
			object.setup(milliseconds, listener, customIdentifier);
			return object;
		}
	},
	m_targetPointInTime : 0,
	m_listener : null,
	m_customIdentifier : null,
	setup : function(milliseconds, listener, customIdentifier) {
		this.m_targetPointInTime = sap.firefly.XSystemUtils
				.getCurrentTimeInMilliseconds()
				+ milliseconds;
		this.m_listener = listener;
		this.m_customIdentifier = customIdentifier;
	},
	releaseObject : function() {
		this.m_customIdentifier = null;
		this.m_listener = null;
		sap.firefly.TimerItem.$superclass.releaseObject.call(this);
	},
	isMatching : function(pointInTime) {
		return (this.m_targetPointInTime <= pointInTime);
	},
	execute : function() {
		this.m_listener.onTimerEvent(this, this.m_customIdentifier);
	}
});
$Firefly
		.createClass(
				"sap.firefly.RegistrationService",
				sap.firefly.XObject,
				{
					$statics : {
						DEFAULT_NAME : "$$default$$",
						SERVICE : "SERVICE",
						SERVICE_CONFIG : "SERVICE_CONFIG",
						UIVIEW : "UIVIEW",
						PROGRAM : "PROGRAM",
						WORKING_TASK_MGR : "WORKING_TASK_MGR",
						RPC_FUNCTION : "RPC_FUNCTION",
						COMMAND : "COMMAND",
						s_registrationService : null,
						getInstance : function() {
							if (sap.firefly.RegistrationService.s_registrationService === null) {
								sap.firefly.RegistrationService.s_registrationService = new sap.firefly.RegistrationService();
								sap.firefly.RegistrationService.s_registrationService
										.setup();
							}
							return sap.firefly.RegistrationService.s_registrationService;
						}
					},
					m_references : null,
					m_qualifiedReferences : null,
					setup : function() {
						this.m_references = sap.firefly.XList.create();
						this.m_qualifiedReferences = sap.firefly.XHashMapByString
								.create();
					},
					releaseObject : function() {
						this.m_qualifiedReferences = sap.firefly.XObject
								.releaseIfNotNull(this.m_qualifiedReferences);
						this.m_references = sap.firefly.XObject
								.releaseIfNotNull(this.m_references);
						sap.firefly.RegistrationService.$superclass.releaseObject
								.call(this);
					},
					addRpcFunction : function(name, clazz) {
						var protocolName = sap.firefly.XString
								.convertToLowerCase(name);
						this.addReferenceWithType(
								sap.firefly.RegistrationService.RPC_FUNCTION,
								protocolName, clazz);
					},
					addService : function(name, clazz) {
						this.addReferenceWithType(
								sap.firefly.RegistrationService.SERVICE, name,
								clazz);
					},
					addUiView : function(name, clazz) {
						this.addReferenceWithType(
								sap.firefly.RegistrationService.UIVIEW, name,
								clazz);
					},
					addStudioProgram : function(name, clazz) {
						this.addReferenceWithType(
								sap.firefly.RegistrationService.PROGRAM, name,
								clazz);
					},
					addServiceConfig : function(name, clazz) {
						this.addReferenceWithType(
								sap.firefly.RegistrationService.SERVICE_CONFIG,
								name, clazz);
					},
					addCommand : function(commandName, clazz) {
						this.addCommandWithType("CUSTOM", commandName, clazz);
					},
					addCommandWithType : function(commandType, commandName,
							clazz) {
						var qualifiedCommandName = sap.firefly.XStringUtils
								.concatenate3(commandType, ".", commandName);
						this.addReferenceWithType(
								sap.firefly.RegistrationService.COMMAND,
								qualifiedCommandName, clazz);
					},
					setWorkingTaskManager : function(type, clazz) {
						this
								.addReferenceWithType(
										sap.firefly.RegistrationService.WORKING_TASK_MGR,
										type.getName(), clazz);
					},
					getWorkingTaskManager : function(type) {
						return this
								.getLastReference(
										sap.firefly.RegistrationService.WORKING_TASK_MGR,
										type.getName());
					},
					addReference : function(fullQualifiedName, clazz) {
						var index = sap.firefly.XString.indexOf(
								fullQualifiedName, ".");
						var type = sap.firefly.XString.substring(
								fullQualifiedName, 0, index);
						var name = sap.firefly.XString.substring(
								fullQualifiedName, index + 1, -1);
						this.addReferenceWithType(type, name, clazz);
					},
					addReferenceWithType : function(type, name, clazz) {
						var accessName = name;
						var serviceTypeName;
						var registrationEntry;
						var clazzMap;
						var listOfClasses;
						if (accessName === null) {
							accessName = sap.firefly.RegistrationService.DEFAULT_NAME;
						}
						serviceTypeName = sap.firefly.XStringUtils
								.concatenate3(type, ".", accessName);
						if (this.hasEntry(serviceTypeName, null, clazz) === false) {
							registrationEntry = sap.firefly.RegistrationEntry
									.create();
							registrationEntry.setXClass(clazz);
							registrationEntry
									.setServiceTypeName(serviceTypeName);
							this.m_references.add(registrationEntry);
							clazzMap = this.m_qualifiedReferences
									.getByKey(type);
							if (clazzMap === null) {
								clazzMap = sap.firefly.XHashMapByString
										.create();
								this.m_qualifiedReferences.put(type, clazzMap);
							}
							listOfClasses = clazzMap.getByKey(accessName);
							if (listOfClasses === null) {
								listOfClasses = sap.firefly.XList.create();
								clazzMap.put(accessName, listOfClasses);
							}
							listOfClasses.add(clazz);
						}
					},
					hasEntry : function(serviceTypeName, name, clazz) {
						var accessName = name;
						var i;
						var reference;
						if (accessName === null) {
							accessName = sap.firefly.RegistrationService.DEFAULT_NAME;
						}
						for (i = 0; i < this.m_references.size(); i++) {
							reference = this.m_references.get(i);
							if (sap.firefly.XString.isEqual(reference
									.getServiceTypeName(), serviceTypeName)
									&& (reference.getXClass() === clazz)
									&& sap.firefly.XString.isEqual(reference
											.getName(), accessName)) {
								return true;
							}
						}
						return false;
					},
					getReferences : function(fullQualifiedName) {
						var registeredClasses = sap.firefly.XList.create();
						var i;
						var reference;
						for (i = 0; i < this.m_references.size(); i++) {
							reference = this.m_references.get(i);
							if (sap.firefly.XString.isEqual(reference
									.getServiceTypeName(), fullQualifiedName)) {
								registeredClasses.add(reference.getXClass());
							}
						}
						if (registeredClasses.isEmpty()) {
							throw sap.firefly.XException
									.createRuntimeException(sap.firefly.XString
											.concatenate2(
													"RegistrationService.getRegisteredClassesForServiceName: no class found for service name ",
													fullQualifiedName));
						}
						return registeredClasses;
					},
					getFirstReference : function(type, name) {
						var accessName = name;
						var classMap;
						var classList;
						if (accessName === null) {
							accessName = sap.firefly.RegistrationService.DEFAULT_NAME;
						}
						classMap = this.m_qualifiedReferences.getByKey(type);
						if (classMap !== null) {
							classList = classMap.getByKey(accessName);
							if (sap.firefly.XCollectionUtils
									.hasElements(classList)) {
								return classList.get(0);
							}
						}
						return null;
					},
					getLastReference : function(type, name) {
						var accessName = name;
						var classMap;
						var classList;
						if (accessName === null) {
							accessName = sap.firefly.RegistrationService.DEFAULT_NAME;
						}
						classMap = this.m_qualifiedReferences.getByKey(type);
						if (classMap !== null) {
							classList = classMap.getByKey(accessName);
							if (sap.firefly.XCollectionUtils
									.hasElements(classList)) {
								return classList.get(classList.size() - 1);
							}
						}
						return null;
					}
				});
$Firefly.createClass("sap.firefly.ExtResult", sap.firefly.XObject, {
	$statics : {
		createWithExternalMessages : function(data, messages) {
			var list = new sap.firefly.ExtResult();
			list.setup(data, messages, true);
			return list;
		},
		create : function(data, messages) {
			var list = new sap.firefly.ExtResult();
			list.setup(data, messages, false);
			return list;
		},
		createCopyExt : function(other) {
			var list = new sap.firefly.ExtResult();
			if (other === null) {
				list.setup(null, other, false);
			} else {
				list.setup(other.getData(), other, false);
			}
			return list;
		},
		createWithErrorMessage : function(errorMessage) {
			var list = new sap.firefly.ExtResult();
			var messageManager = sap.firefly.MessageManager
					.createMessageManager();
			messageManager.addError(sap.firefly.ErrorCodes.OTHER_ERROR,
					errorMessage);
			list.setup(null, messageManager, false);
			return list;
		},
		createWithMessage : function(message) {
			var list = new sap.firefly.ExtResult();
			var messageManager = sap.firefly.MessageManager
					.createMessageManager();
			messageManager.addMessage(message);
			list.setup(null, messageManager, false);
			return list;
		}
	},
	m_messageCollection : null,
	m_data : null,
	releaseObject : function() {
		this.m_data = null;
		this.m_messageCollection = sap.firefly.XObject
				.releaseIfNotNull(this.m_messageCollection);
		sap.firefly.ExtResult.$superclass.releaseObject.call(this);
	},
	setup : function(data, messages, externalMessages) {
		this.m_data = data;
		if ((externalMessages) && (messages !== null)) {
			this.m_messageCollection = messages;
		} else {
			this.m_messageCollection = sap.firefly.MessageManager
					.createMessageManager();
			if (messages !== null) {
				(this.m_messageCollection).addAllMessages(messages);
			}
		}
	},
	getData : function() {
		return this.m_data;
	},
	hasErrors : function() {
		return this.m_messageCollection.hasErrors();
	},
	isValid : function() {
		return this.m_messageCollection.isValid();
	},
	getNumberOfErrors : function() {
		return this.m_messageCollection.getNumberOfErrors();
	},
	hasSeverity : function(severity) {
		return this.m_messageCollection.hasSeverity(severity);
	},
	getNumberOfSeverity : function(severity) {
		return this.m_messageCollection.getNumberOfSeverity(severity);
	},
	getFirstWithSeverity : function(severity) {
		return this.m_messageCollection.getFirstWithSeverity(severity);
	},
	getErrors : function() {
		return this.m_messageCollection.getErrors();
	},
	getWarnings : function() {
		return this.m_messageCollection.getWarnings();
	},
	getInfos : function() {
		return this.m_messageCollection.getInfos();
	},
	getSemanticalErrors : function() {
		return this.m_messageCollection.getSemanticalErrors();
	},
	getMessages : function() {
		return this.m_messageCollection.getMessages();
	},
	getFirstError : function() {
		return this.m_messageCollection.getFirstError();
	},
	getSummary : function() {
		return this.m_messageCollection.getSummary();
	},
	getRootProfileNode : function() {
		return this.m_messageCollection.getRootProfileNode();
	},
	toString : function() {
		return this.m_messageCollection.toString();
	}
});
$Firefly.createClass("sap.firefly.ProfileNode", sap.firefly.XObject, {
	$statics : {
		create : function(text, pointInTime) {
			var newObject = new sap.firefly.ProfileNode();
			newObject.m_text = text;
			newObject.m_start = pointInTime;
			return newObject;
		},
		createWithDuration : function(text, duration) {
			var newObject = new sap.firefly.ProfileNode();
			newObject.m_text = text;
			newObject.m_duration = duration;
			return newObject;
		},
		renderNode : function(buffer, node, indent, step) {
			var i;
			var text;
			var profileSteps;
			var j;
			for (i = 0; i < indent; i++) {
				buffer.append("|  ");
			}
			buffer.append("#");
			buffer.appendInt(step);
			buffer.append(": ");
			text = node.getProfileNodeText();
			if (text === null) {
				buffer.append("Node");
			} else {
				buffer.append(node.getProfileNodeText());
			}
			buffer.append(" ");
			buffer.appendLong(node.getDuration());
			buffer.append("ms");
			profileSteps = node.getProfileSteps();
			if (profileSteps !== null) {
				for (j = 0; j < profileSteps.size(); j++) {
					buffer.appendNewLine();
					sap.firefly.ProfileNode.renderNode(buffer, profileSteps
							.get(j), indent + 1, j);
				}
			}
		}
	},
	m_steps : null,
	m_start : 0,
	m_end : 0,
	m_duration : 0,
	m_text : null,
	m_lastOpenStep : null,
	m_hasParent : false,
	releaseObject : function() {
		this.m_lastOpenStep = sap.firefly.XObject
				.releaseIfNotNull(this.m_lastOpenStep);
		this.m_steps = sap.firefly.XCollectionUtils
				.releaseEntriesAndCollectionIfNotNull(this.m_steps);
		this.m_text = null;
		sap.firefly.ProfileNode.$superclass.releaseObject.call(this);
	},
	getProfilingStart : function() {
		return this.m_start;
	},
	getProfilingEnd : function() {
		return this.m_end;
	},
	setProfilingEnd : function(end) {
		this.m_end = end;
		return this.m_end;
	},
	getDuration : function() {
		if (this.m_start === 0) {
			return this.m_duration;
		}
		if (this.m_end === 0) {
			return -2;
		}
		return this.m_end - this.m_start;
	},
	getProfileSteps : function() {
		return this.m_steps;
	},
	getProfileNodeText : function() {
		return this.m_text;
	},
	renameLastProfileStep : function(text) {
		var lastNode;
		if (sap.firefly.XCollectionUtils.hasElements(this.m_steps)) {
			lastNode = this.m_steps.get(this.m_steps.size() - 1);
			lastNode.m_text = text;
		}
	},
	addProfileStep : function(text) {
		var pointInTime = sap.firefly.XSystemUtils
				.getCurrentTimeInMilliseconds();
		var newNode;
		if (this.m_steps === null) {
			this.m_steps = sap.firefly.XList.create();
			if (this.m_start === 0) {
				this.m_start = pointInTime;
			} else {
				this.m_lastOpenStep = sap.firefly.ProfileNode.create(
						"callWarmup", this.m_start);
				this.addNode(this.m_lastOpenStep);
			}
		}
		this.configureLast(pointInTime);
		newNode = sap.firefly.ProfileNode.create(text, pointInTime);
		this.addNode(newNode);
		this.m_lastOpenStep = newNode;
	},
	addProfileNode : function(node) {
		var pointInTime;
		if (node.hasProfileParent() === false) {
			pointInTime = node.getProfilingStart();
			if (this.m_steps === null) {
				this.m_steps = sap.firefly.XList.create();
				if (pointInTime !== 0) {
					if (this.m_start === 0) {
						this.m_start = pointInTime;
					} else {
						this.m_lastOpenStep = sap.firefly.ProfileNode.create(
								"callWarmup", this.m_start);
						this.addNode(this.m_lastOpenStep);
					}
				}
			}
			if (pointInTime !== 0) {
				this.configureLast(pointInTime);
			}
			this.addNode(node);
			this.m_lastOpenStep = null;
		}
	},
	addNode : function(node) {
		var pn = node;
		pn.m_hasParent = true;
		this.m_steps.add(pn);
	},
	endProfileStep : function() {
		var end = this.setProfilingEnd(sap.firefly.XSystemUtils
				.getCurrentTimeInMilliseconds());
		this.configureLast(end);
	},
	configureLast : function(pointInTime) {
		var size;
		var lastNode;
		var lastEnding;
		var delta;
		var deltaNode;
		if (this.m_lastOpenStep !== null) {
			this.m_lastOpenStep.setProfilingEnd(pointInTime);
		} else {
			size = this.m_steps.size();
			if (size > 0) {
				lastNode = this.m_steps.get(size - 1);
				lastEnding = lastNode.getProfilingEnd();
				delta = pointInTime - lastEnding;
				if (delta > 0) {
					deltaNode = sap.firefly.ProfileNode.create("delta",
							lastEnding);
					deltaNode.setProfilingEnd(pointInTime);
					this.addNode(deltaNode);
				}
			}
		}
	},
	detailProfileNode : function(name, detailNode, nameOfRest) {
		var foundNode = this.searchRecursive(name, this);
		var roundtripTime;
		var delta;
		var networkNode;
		if (foundNode !== null) {
			if (foundNode.m_steps === null) {
				foundNode.m_steps = sap.firefly.XList.create();
			} else {
				foundNode.m_steps.clear();
			}
			foundNode.addNode(detailNode);
			roundtripTime = foundNode.getDuration();
			delta = roundtripTime - detailNode.getDuration();
			networkNode = sap.firefly.ProfileNode.createWithDuration(
					nameOfRest, delta);
			foundNode.addNode(networkNode);
		}
	},
	searchRecursive : function(text, node) {
		var profileSteps = node.getProfileSteps();
		var size;
		var i;
		var foundNode;
		if (profileSteps !== null) {
			size = profileSteps.size();
			for (i = 0; i < size; i++) {
				foundNode = this.searchRecursive(text, profileSteps.get(i));
				if (foundNode !== null) {
					return foundNode;
				}
			}
		} else {
			if (sap.firefly.XString.isEqual(text, node.getProfileNodeText())) {
				return node;
			}
		}
		return null;
	},
	hasProfileParent : function() {
		return this.m_hasParent;
	},
	toString : function() {
		var buffer = sap.firefly.XStringBuffer.create();
		sap.firefly.ProfileNode.renderNode(buffer, this, 0, 0);
		return buffer.toString();
	}
});
$Firefly.createClass("sap.firefly.DfDispatcher", sap.firefly.XObject, {
	registerInterval : function(intervalMilliseconds, listener,
			customIdentifier) {
		return null;
	},
	unregisterInterval : function(handle) {
	},
	registerTimer : function(delayMilliseconds, listener, customIdentifier) {
		return null;
	},
	unregisterTimer : function(handle) {
	},
	getSyncState : function() {
		return null;
	},
	process : function() {
	},
	registerProcessingTimeReceiver : function(processingTimeReceiver) {
	},
	unregisterProcessingTimeReceiver : function(processingTimeReceiver) {
	},
	getProcessingTimeReceiverCount : function() {
		return -1;
	},
	shutdown : function() {
	}
});
$Firefly
		.createClass(
				"sap.firefly.DefaultSession",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(memoryManager) {
							return sap.firefly.DefaultSession
									.createWithVersion(memoryManager,
											sap.firefly.XVersion.DEFAULT_VALUE);
						},
						createWithVersion : function(memoryManager, version) {
							var session = new sap.firefly.DefaultSession();
							session.setup(memoryManager, version);
							return session;
						}
					},
					m_memoryManager : null,
					m_releaseMemoryMgr : false,
					m_singletons : null,
					m_workingTaskManager : null,
					m_defaultSyncType : null,
					m_notificationProcessor : null,
					m_version : 0,
					m_currentSid : 0,
					m_appSessionId : null,
					setup : function(memoryManager, version) {
						var myMemoryManager;
						this.m_appSessionId = sap.firefly.XGuid.getGuid();
						myMemoryManager = memoryManager;
						if (myMemoryManager === null) {
							this.m_memoryManager = sap.firefly.MemoryManager
									.create();
							this.m_releaseMemoryMgr = true;
						} else {
							this.m_memoryManager = memoryManager;
							this.m_releaseMemoryMgr = false;
						}
						this.m_version = version;
						this.m_defaultSyncType = sap.firefly.SyncType.BLOCKING;
						this.m_singletons = sap.firefly.XHashMapByString
								.create();
						if (this
								.newWorkingTaskManager(sap.firefly.WorkingTaskManagerType.UI_DRIVER) === false) {
							if (this
									.newWorkingTaskManager(sap.firefly.WorkingTaskManagerType.MULTI_THREADED) === false) {
								this
										.newWorkingTaskManager(sap.firefly.WorkingTaskManagerType.SINGLE_THREADED);
							}
						}
					},
					newWorkingTaskManager : function(type) {
						var registrationService = sap.firefly.RegistrationService
								.getInstance();
						var clazz = registrationService
								.getWorkingTaskManager(type);
						var newInstance;
						if (clazz !== null) {
							newInstance = clazz.newInstance(this);
							newInstance.setupWorkingTaskManager(this);
							this.m_workingTaskManager = newInstance;
							return true;
						}
						return false;
					},
					releaseObject : function() {
						this.m_defaultSyncType = null;
						this.m_appSessionId = null;
						if (this.m_releaseMemoryMgr) {
							this.m_memoryManager.releaseObject();
							this.m_memoryManager = null;
						}
						this.m_notificationProcessor = null;
						this.m_singletons = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_singletons);
						this.m_workingTaskManager = sap.firefly.XObject
								.releaseIfNotNull(this.m_workingTaskManager);
						sap.firefly.DefaultSession.$superclass.releaseObject
								.call(this);
					},
					getSession : function() {
						return this;
					},
					getMemoryManager : function() {
						return this.m_memoryManager;
					},
					addWarning : function(warning) {
					},
					addMessage : function(message) {
					},
					getSessionSingletons : function() {
						return this.m_singletons;
					},
					getWorkingTaskManager : function() {
						return this.m_workingTaskManager;
					},
					getDefaultSyncType : function() {
						return this.m_defaultSyncType;
					},
					setDefaultSyncType : function(syncType) {
						this.m_defaultSyncType = syncType;
					},
					getListenerProcessor : function() {
						return this.m_notificationProcessor;
					},
					setListenerProcessor : function(processor) {
						this.m_notificationProcessor = processor;
					},
					getVersion : function() {
						return this.m_version;
					},
					getNextSid : function() {
						this.m_currentSid = this.m_currentSid + 1;
						return this.m_currentSid;
					},
					getAppSessionId : function() {
						return this.m_appSessionId;
					},
					setAppSessionId : function(appSessionId) {
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(appSessionId)) {
							this.m_appSessionId = appSessionId;
						}
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						buffer.append("Session Version: ");
						buffer.appendInt(this.m_version);
						buffer.append(", Application Session Id: ");
						buffer.append(this.m_appSessionId);
						return buffer.toString();
					}
				});
$Firefly.createClass("sap.firefly.DfWorkingTask", sap.firefly.DfSessionContext,
		{
			setupTask : function(session) {
				this.setupSessionContext(session);
			},
			processInputOnWorkerThread : function(handle) {
			},
			processOutputOnMainThread : function(handle) {
			},
			isFinishedOnWorkerThread : function(handle) {
				return true;
			}
		});
$Firefly.createClass("sap.firefly.WorkingTaskManager",
		sap.firefly.DfSessionContext, {
			$statics : {
				staticSetup : function() {
					var clazz = sap.firefly.XClass
							.create(sap.firefly.WorkingTaskManager);
					var registrationService = sap.firefly.RegistrationService
							.getInstance();
					registrationService.setWorkingTaskManager(
							sap.firefly.WorkingTaskManagerType.SINGLE_THREADED,
							clazz);
				}
			},
			m_handles : null,
			m_syncState : null,
			m_workerThreadNumber : 0,
			setupWorkingTaskManager : function(session) {
				sap.firefly.WorkingTaskManager.$superclass.setupSessionContext
						.call(this, session);
				this.m_handles = sap.firefly.XList.create();
				this.m_syncState = sap.firefly.SyncState.IN_SYNC;
			},
			releaseObject : function() {
				var dispatcher = sap.firefly.Dispatcher.getInstance();
				if (dispatcher !== null) {
					dispatcher.unregisterProcessingTimeReceiver(this);
				}
				this.m_handles = sap.firefly.XObject
						.releaseIfNotNull(this.m_handles);
				this.m_syncState = null;
				sap.firefly.WorkingTaskManager.$superclass.releaseObject
						.call(this);
			},
			getType : function() {
				return sap.firefly.WorkingTaskManagerType.SINGLE_THREADED;
			},
			createHandle : function(task) {
				var taskHandle = sap.firefly.WorkingTaskHandle.create(this,
						task);
				return taskHandle;
			},
			addHandleToProcessingQueue : function(handle) {
				if (this.m_handles.contains(handle) === false) {
					this.m_handles.add(handle);
				}
				if (this.m_syncState === sap.firefly.SyncState.IN_SYNC) {
					this.m_syncState = sap.firefly.SyncState.OUT_OF_SYNC;
				}
				if (this.m_syncState === sap.firefly.SyncState.OUT_OF_SYNC) {
					sap.firefly.Dispatcher.getInstance()
							.registerProcessingTimeReceiver(this);
				}
			},
			processSynchronization : function(syncType) {
				var i;
				var taskHandle;
				var isFinished;
				for (i = 0; i < this.m_handles.size();) {
					taskHandle = this.m_handles.get(i);
					taskHandle.processWorkerThread();
					taskHandle.processMainThread();
					isFinished = taskHandle.isFinished();
					if (isFinished) {
						this.removeHandle(taskHandle);
					} else {
						i++;
					}
				}
				if (this.m_handles.isEmpty()) {
					this.m_syncState = sap.firefly.SyncState.IN_SYNC;
				}
				return true;
			},
			getSyncState : function() {
				return this.m_syncState;
			},
			waitUntilFinished : function(handle, syncType) {
				var isFinished = false;
				while (isFinished === false) {
					handle.processWorkerThread();
					handle.processMainThread();
					isFinished = handle.isFinished();
				}
				this.removeHandle(handle);
			},
			removeHandle : function(handle) {
				this.m_handles.removeElement(handle);
			},
			getNextWorkerThreadName : function() {
				var buffer = sap.firefly.XStringBuffer.create();
				buffer.append("WorkerThread");
				buffer.appendInt(this.m_workerThreadNumber);
				this.m_workerThreadNumber = this.m_workerThreadNumber + 1;
				return buffer.toString();
			},
			setMainSleepTime : function(milliseconds) {
			}
		});
$Firefly
		.createClass(
				"sap.firefly.MessageManager",
				sap.firefly.XObject,
				{
					$statics : {
						MMGR_DEBUG_MODE : false,
						MMGR_PROFILING_MODE : false,
						createMessageManager : function() {
							var object = new sap.firefly.MessageManager();
							object.setup();
							return object;
						},
						shouldMessageBeAdded : function(message) {
							var messageCode;
							var severity;
							if (message !== null) {
								messageCode = message.getCode();
								if (messageCode === 42021) {
									severity = message.getSeverity();
									if (severity === sap.firefly.Severity.WARNING) {
										return false;
									}
								}
							}
							return true;
						}
					},
					m_messages : null,
					m_profileNode : null,
					setup : function() {
						this.m_messages = sap.firefly.XList.create();
						this.m_profileNode = sap.firefly.ProfileNode.create(
								this.getComponentName(), 0);
					},
					getDefaultMessageLayer : function() {
						return sap.firefly.OriginLayer.APPLICATION;
					},
					releaseObject : function() {
						this.m_messages = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_messages);
						this.m_profileNode = sap.firefly.XObject
								.releaseIfNotNull(this.m_profileNode);
						sap.firefly.MessageManager.$superclass.releaseObject
								.call(this);
					},
					getComponentName : function() {
						return "MessageManager";
					},
					isValid : function() {
						return !this.hasErrors();
					},
					hasErrors : function() {
						return this.hasSeverity(sap.firefly.Severity.ERROR);
					},
					getNumberOfErrors : function() {
						return this
								.getNumberOfSeverity(sap.firefly.Severity.ERROR);
					},
					hasSeverity : function(severity) {
						var size = this.m_messages.size();
						var i;
						for (i = 0; i < size; i++) {
							if (this.m_messages.get(i).getSeverity() === severity) {
								return true;
							}
						}
						return false;
					},
					getNumberOfSeverity : function(severity) {
						var count = 0;
						var size = this.m_messages.size();
						var i;
						for (i = 0; i < size; i++) {
							if (this.m_messages.get(i).getSeverity() === severity) {
								count++;
							}
						}
						return count;
					},
					getFirstError : function() {
						return this
								.getFirstWithSeverity(sap.firefly.Severity.ERROR);
					},
					getFirstWithSeverity : function(severity) {
						var size = this.m_messages.size();
						var i;
						var msg;
						for (i = 0; i < size; i++) {
							msg = this.m_messages.get(i);
							if (msg.getSeverity() === severity) {
								return msg;
							}
						}
						return null;
					},
					getErrors : function() {
						return this
								.getMessagesBySeverity(sap.firefly.Severity.ERROR);
					},
					getWarnings : function() {
						return this
								.getMessagesBySeverity(sap.firefly.Severity.WARNING);
					},
					getInfos : function() {
						return this
								.getMessagesBySeverity(sap.firefly.Severity.INFO);
					},
					getSemanticalErrors : function() {
						return this
								.getMessagesBySeverity(sap.firefly.Severity.SEMANTICAL_ERROR);
					},
					getMessagesBySeverity : function(severity) {
						var returnList = sap.firefly.XList.create();
						var size = this.m_messages.size();
						var i;
						var msg;
						for (i = 0; i < size; i++) {
							msg = this.m_messages.get(i);
							if (msg.getSeverity() === severity) {
								returnList.add(msg);
							}
						}
						return returnList;
					},
					getMessages : function() {
						return this.m_messages;
					},
					addInfo : function(code, message) {
						return this.addInfoExt(this.getDefaultMessageLayer(),
								code, message);
					},
					addInfoExt : function(originLayer, code, message) {
						var error = sap.firefly.XMessage.createMessage(
								originLayer, sap.firefly.Severity.INFO, code,
								message, null, true, null);
						this.addMessage(error);
						return error;
					},
					addWarning : function(code, message) {
						return this.addWarningExt(
								this.getDefaultMessageLayer(), code, message);
					},
					addWarningExt : function(originLayer, code, message) {
						var error = sap.firefly.XMessage.createMessage(
								originLayer, sap.firefly.Severity.WARNING,
								code, message, null, true, null);
						this.addMessage(error);
						return error;
					},
					addErrorWithMessage : function(message) {
						return this.addErrorExt(this.getDefaultMessageLayer(),
								sap.firefly.ErrorCodes.OTHER_ERROR, message,
								null);
					},
					addError : function(code, message) {
						return this.addErrorExt(this.getDefaultMessageLayer(),
								code, message, null);
					},
					addErrorExt : function(originLayer, code, message,
							extendedInfo) {
						var error = sap.firefly.XMessage.createErrorWithCode(
								originLayer, code, message, null, true,
								extendedInfo);
						this.addMessage(error);
						return error;
					},
					addSemanticalError : function(originLayer, code, message) {
						var newMessage = sap.firefly.XMessage.createMessage(
								originLayer,
								sap.firefly.Severity.SEMANTICAL_ERROR, code,
								message, null, true, null);
						this.addMessage(newMessage);
						return newMessage;
					},
					addAllMessages : function(messages) {
						var rootProfileNode;
						if (messages === null) {
							return;
						}
						this.addMessages(messages.getMessages());
						rootProfileNode = messages.getRootProfileNode();
						this.addProfileNode(rootProfileNode);
					},
					addMessages : function(messages) {
						if (messages !== null) {
							this.m_messages.addAll(messages);
						}
					},
					addMessage : function(message) {
						if (sap.firefly.MessageManager
								.shouldMessageBeAdded(message)
								&& (this.m_messages !== null)) {
							this.m_messages.add(message);
						}
					},
					clearMessages : function() {
						this.m_messages.clear();
					},
					getDuration : function() {
						if (this.m_profileNode === null) {
							return -1;
						}
						return this.m_profileNode.getDuration();
					},
					getProfilingStart : function() {
						if (this.m_profileNode === null) {
							return -1;
						}
						return this.m_profileNode.getProfilingStart();
					},
					getProfilingEnd : function() {
						if (this.m_profileNode === null) {
							return -1;
						}
						return this.m_profileNode.getProfilingEnd();
					},
					getProfileSteps : function() {
						if (this.m_profileNode === null) {
							return null;
						}
						return this.m_profileNode.getProfileSteps();
					},
					getProfileNodeText : function() {
						if (this.m_profileNode === null) {
							return null;
						}
						return this.m_profileNode.getProfileNodeText();
					},
					addProfileStep : function(text) {
						if (this.m_profileNode !== null) {
							this.m_profileNode.addProfileStep(text);
						}
					},
					hasProfileParent : function() {
						if (this.m_profileNode === null) {
							return false;
						}
						return this.m_profileNode.hasProfileParent();
					},
					detailProfileNode : function(name, detailNode, nameOfRest) {
						if (this.m_profileNode !== null) {
							this.m_profileNode.detailProfileNode(name,
									detailNode, nameOfRest);
						}
					},
					renameLastProfileStep : function(text) {
						if (this.m_profileNode !== null) {
							this.m_profileNode.renameLastProfileStep(text);
						}
					},
					addProfileNode : function(node) {
						if ((node !== null) && (node.getProfilingStart() !== 0)) {
							if (this.m_profileNode !== null) {
								this.m_profileNode.addProfileNode(node);
							}
						}
					},
					endProfileStep : function() {
						if (this.m_profileNode !== null) {
							this.m_profileNode.endProfileStep();
						}
					},
					getRootProfileNode : function() {
						return this.m_profileNode;
					},
					getSummary : function() {
						var sb = sap.firefly.XStringBuffer.create();
						var iterator;
						var first;
						if (this.m_messages.hasElements()) {
							iterator = this.m_messages.getIterator();
							first = true;
							while (iterator.hasNext()) {
								if (first) {
									first = false;
								} else {
									sb.appendNewLine();
								}
								sb.append(iterator.next().toString());
							}
							iterator.releaseObject();
						}
						if ((sap.firefly.MessageManager.MMGR_PROFILING_MODE)
								&& (this.m_profileNode !== null)) {
							sb.append("=== Profiling Result ===");
							sb.appendNewLine();
							sb.append(this.m_profileNode.toString());
						}
						return sb.toString();
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						if (this.m_messages.isEmpty()) {
							sb.append("No errors - everything OK");
							sb.appendNewLine();
						} else {
							sb.append("Messages");
							sb.appendNewLine();
							sb.append(this.getSummary());
						}
						return sb.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XValueAccess",
				sap.firefly.XObject,
				{
					$statics : {
						create : function() {
							return new sap.firefly.XValueAccess();
						},
						createWithType : function(valueType) {
							var newObj = new sap.firefly.XValueAccess();
							newObj.m_type = valueType;
							return newObj;
						},
						createWithValue : function(value) {
							var newObj = new sap.firefly.XValueAccess();
							newObj.m_value = value;
							newObj.m_type = value.getValueType();
							return newObj;
						},
						copy : function(source, dest) {
							var valueType = source.getValueType();
							if (valueType === sap.firefly.XValueType.INTEGER) {
								dest.setIntegerValue(source.getIntegerValue());
							} else {
								if (valueType === sap.firefly.XValueType.LONG) {
									dest.setLongValue(source.getLongValue());
								} else {
									if (valueType === sap.firefly.XValueType.DOUBLE) {
										dest.setDoubleValue(source
												.getDoubleValue());
									} else {
										if (valueType === sap.firefly.XValueType.STRING) {
											dest.setStringValue(source
													.getStringValue());
										} else {
											if (valueType === sap.firefly.XValueType.BOOLEAN) {
												dest.setBooleanValue(source
														.getBooleanValue());
											} else {
												if (valueType === sap.firefly.XValueType.DATE) {
													dest.setDateValue(source
															.getDateValue()
															.clone());
												} else {
													if (valueType === sap.firefly.XValueType.TIME) {
														dest
																.setTimeValue(source
																		.getTimeValue()
																		.clone());
													} else {
														if (valueType === sap.firefly.XValueType.DATE_TIME) {
															dest
																	.setDateTimeValue(source
																			.getDateTimeValue()
																			.clone());
														} else {
															if (valueType === sap.firefly.XValueType.TIMESPAN) {
																dest
																		.setTimeSpanValue(source
																				.getTimeSpanValue());
															} else {
																if (valueType === sap.firefly.XValueType.LINE_STRING) {
																	dest
																			.setLineStringValue(source
																					.getLineStringValue()
																					.clone());
																} else {
																	if (valueType === sap.firefly.XValueType.MULTI_LINE_STRING) {
																		dest
																				.setMultiLineStringValue(source
																						.getMultiLineStringValue()
																						.clone());
																	} else {
																		if (valueType === sap.firefly.XValueType.POINT) {
																			dest
																					.setPointValue(source
																							.getPointValue()
																							.clone());
																		} else {
																			if (valueType === sap.firefly.XValueType.MULTI_POINT) {
																				dest
																						.setMultiPointValue(source
																								.getMultiPointValue()
																								.clone());
																			} else {
																				if (valueType === sap.firefly.XValueType.POLYGON) {
																					dest
																							.setPolygonValue(source
																									.getPolygonValue()
																									.clone());
																				} else {
																					if (valueType === sap.firefly.XValueType.MULTI_POLYGON) {
																						dest
																								.setMultiPolygonValue(source
																										.getMultiPolygonValue()
																										.clone());
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					},
					m_type : null,
					m_value : null,
					releaseObject : function() {
						this.m_type = null;
						this.m_value = sap.firefly.XObject
								.releaseIfNotNull(this.m_value);
						sap.firefly.XValueAccess.$superclass.releaseObject
								.call(this);
					},
					isEqualTo : function(other) {
						var xOther;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						xOther = other;
						if (this.hasValue() !== xOther.hasValue()) {
							return false;
						} else {
							if ((this.getValue() === null)
									&& (xOther.getValue() === null)) {
								return this.getValueType() === xOther
										.getValueType();
							} else {
								return this.getValue().isEqualTo(
										xOther.getValue());
							}
						}
					},
					getValueType : function() {
						return this.m_type;
					},
					getValue : function() {
						return this.m_value;
					},
					getStringValue : function() {
						if (this.m_value === null) {
							return null;
						}
						if (this.m_type.isSpatial()) {
							return (this.m_value).toWKT();
						}
						return this.m_value.toString();
					},
					assertValueType : function(expected) {
						if ((this.m_type !== null)
								&& (this.m_type !== expected)) {
							throw sap.firefly.XException
									.createIllegalArgumentException(sap.firefly.XString
											.concatenate2(
													"ValueAccess is not of type ",
													expected.getName()));
						}
					},
					setStringValue : function(stringValue) {
						this.assertValueType(sap.firefly.XValueType.STRING);
						this.m_type = sap.firefly.XValueType.STRING;
						this.m_value = sap.firefly.XStringValue
								.create(stringValue);
					},
					getIntegerValue : function() {
						if (this.m_type === sap.firefly.XValueType.INTEGER) {
							return (this.m_value).getIntegerValue();
						}
						return 0;
					},
					setIntegerValue : function(integerValue) {
						this.assertValueType(sap.firefly.XValueType.INTEGER);
						this.m_value = sap.firefly.XIntegerValue
								.create(integerValue);
						this.m_type = sap.firefly.XValueType.INTEGER;
					},
					getBooleanValue : function() {
						if (this.m_type === sap.firefly.XValueType.BOOLEAN) {
							return (this.m_value).getBooleanValue();
						}
						if (this.m_type === sap.firefly.XValueType.INTEGER) {
							return this.getIntegerValue() !== 0;
						}
						if (this.m_type === sap.firefly.XValueType.LONG) {
							return this.getLongValue() !== 0;
						}
						if (this.m_type === sap.firefly.XValueType.DOUBLE) {
							return this.getDoubleValue() !== 0;
						}
						if (this.m_type === sap.firefly.XValueType.STRING) {
							return sap.firefly.XString
									.isEqual(
											sap.firefly.XString
													.convertToUpperCase(sap.firefly.XString
															.trim(this
																	.getStringValue())),
											"TRUE");
						}
						return false;
					},
					setBooleanValue : function(booleanValue) {
						this.assertValueType(sap.firefly.XValueType.BOOLEAN);
						this.m_value = sap.firefly.XBooleanValue
								.create(booleanValue);
						this.m_type = sap.firefly.XValueType.BOOLEAN;
					},
					getLongValue : function() {
						if (this.m_type === sap.firefly.XValueType.LONG) {
							return (this.m_value).getLongValue();
						}
						if (this.m_type === sap.firefly.XValueType.INTEGER) {
							return (this.m_value).getIntegerValue();
						}
						if (this.m_type === sap.firefly.XValueType.DOUBLE) {
							return sap.firefly.XDouble
									.convertDoubleToLong((this.m_value)
											.getDoubleValue());
						}
						if (this.m_type === sap.firefly.XValueType.STRING) {
							return sap.firefly.XLong
									.convertStringToLong(this.m_value
											.toString());
						}
						if (this.m_type === sap.firefly.XValueType.TIMESPAN) {
							return (this.m_value).getTimeSpan();
						}
						return 0;
					},
					setLongValue : function(longValue) {
						this.assertValueType(sap.firefly.XValueType.LONG);
						this.m_value = sap.firefly.XLongValue.create(longValue);
						this.m_type = sap.firefly.XValueType.LONG;
					},
					getDoubleValue : function() {
						if (this.m_type === sap.firefly.XValueType.DOUBLE) {
							return (this.m_value).getDoubleValue();
						}
						if (this.m_type === sap.firefly.XValueType.STRING) {
							return sap.firefly.XDouble
									.convertStringToDouble(this
											.getStringValue());
						}
						if (this.m_type === sap.firefly.XValueType.INTEGER) {
							return sap.firefly.XInteger
									.convertIntegerToDouble(this
											.getIntegerValue());
						}
						if (this.m_type === sap.firefly.XValueType.LONG) {
							return sap.firefly.XLong.convertLongToDouble(this
									.getLongValue());
						}
						if (this.m_type === sap.firefly.XValueType.TIMESPAN) {
							return sap.firefly.XLong
									.convertLongToDouble((this.m_value)
											.getTimeSpan());
						}
						return 0;
					},
					setDoubleValue : function(doubleValue) {
						this.assertValueType(sap.firefly.XValueType.DOUBLE);
						this.m_value = sap.firefly.XDoubleValue
								.create(doubleValue);
						this.m_type = sap.firefly.XValueType.DOUBLE;
					},
					setDateValue : function(dateValue) {
						this.assertValueType(sap.firefly.XValueType.DATE);
						this.m_value = dateValue;
						this.m_type = sap.firefly.XValueType.DATE;
					},
					getDateValue : function() {
						return this.m_value;
					},
					setDateTimeValue : function(dateTimeValue) {
						this.assertValueType(sap.firefly.XValueType.DATE_TIME);
						this.m_value = dateTimeValue;
						this.m_type = sap.firefly.XValueType.DATE_TIME;
					},
					getDateTimeValue : function() {
						return this.m_value;
					},
					getTimeValue : function() {
						return this.m_value;
					},
					setTimeValue : function(timeValue) {
						this.assertValueType(sap.firefly.XValueType.TIME);
						this.m_value = timeValue;
						this.m_type = sap.firefly.XValueType.TIME;
					},
					getTimeSpanValue : function() {
						return this.m_value;
					},
					setTimeSpanValue : function(value) {
						this.assertValueType(sap.firefly.XValueType.TIMESPAN);
						this.m_value = value;
						this.m_type = sap.firefly.XValueType.TIMESPAN;
					},
					getGeometry : function() {
						return this.m_value;
					},
					getPolygonValue : function() {
						return this.m_value;
					},
					setPolygonValue : function(value) {
						this.assertValueType(sap.firefly.XValueType.POLYGON);
						this.m_value = value;
						this.m_type = sap.firefly.XValueType.POLYGON;
					},
					getPointValue : function() {
						return this.m_value;
					},
					setPointValue : function(value) {
						this.assertValueType(sap.firefly.XValueType.POINT);
						this.m_value = value;
						this.m_type = sap.firefly.XValueType.POINT;
					},
					setMultiPointValue : function(value) {
						this
								.assertValueType(sap.firefly.XValueType.MULTI_POINT);
						this.m_value = value;
						this.m_type = sap.firefly.XValueType.MULTI_POINT;
					},
					getMultiPointValue : function() {
						return this.m_value;
					},
					setMultiPolygonValue : function(value) {
						this
								.assertValueType(sap.firefly.XValueType.MULTI_POLYGON);
						this.m_value = value;
						this.m_type = sap.firefly.XValueType.MULTI_POLYGON;
					},
					getMultiPolygonValue : function() {
						return this.m_value;
					},
					setLineStringValue : function(value) {
						this
								.assertValueType(sap.firefly.XValueType.LINE_STRING);
						this.m_value = value;
						this.m_type = sap.firefly.XValueType.LINE_STRING;
					},
					getLineStringValue : function() {
						return this.m_value;
					},
					setMultiLineStringValue : function(value) {
						this
								.assertValueType(sap.firefly.XValueType.MULTI_LINE_STRING);
						this.m_value = value;
						this.m_type = sap.firefly.XValueType.MULTI_LINE_STRING;
					},
					getMultiLineStringValue : function() {
						return this.m_value;
					},
					getNullValue : function() {
						return null;
					},
					setNullValue : function(nullValueType) {
						this.m_value = null;
						this.m_type = nullValueType;
					},
					hasValue : function() {
						return this.m_value !== null;
					},
					copyFrom : function(source) {
						sap.firefly.XValueAccess.copy(source, this);
					},
					parseStringValue : function(value) {
						var messages = sap.firefly.MessageManager
								.createMessageManager();
						var valueType = this.getValueType();
						var doubleValue;
						var intValue;
						var longValue;
						var booleanValue;
						var dateValue;
						var timeValue;
						var dateTimeValue;
						var timespan;
						var timeSpanValue;
						var geometryType;
						var geometryValue;
						var message;
						if (valueType === sap.firefly.XValueType.STRING) {
							this.setStringValue(value);
						} else {
							if ((valueType === sap.firefly.XValueType.DOUBLE)
									|| (valueType === sap.firefly.XValueType.DECIMAL_FLOAT)) {
								try {
									doubleValue = sap.firefly.XDouble
											.convertStringToDouble(value);
									this.setDoubleValue(doubleValue);
								} catch (a) {
									messages
											.addError(
													sap.firefly.ErrorCodes.PARSING_ERROR_DOUBLE_VALUE,
													"Cannot parse double value");
								}
							} else {
								if (valueType === sap.firefly.XValueType.INTEGER) {
									try {
										intValue = sap.firefly.XInteger
												.convertStringToIntegerWithRadix(
														value, 10);
										this.setIntegerValue(intValue);
									} catch (b) {
										messages
												.addError(
														sap.firefly.ErrorCodes.PARSING_ERROR_INT_VALUE,
														"Cannot parse integer value");
									}
								} else {
									if (valueType === sap.firefly.XValueType.LONG) {
										try {
											longValue = sap.firefly.XLong
													.convertStringToLong(value);
											this.setLongValue(longValue);
										} catch (c) {
											messages
													.addError(
															sap.firefly.ErrorCodes.PARSING_ERROR_LONG_VALUE,
															"Cannot parse long value");
										}
									} else {
										if (valueType === sap.firefly.XValueType.BOOLEAN) {
											try {
												booleanValue = sap.firefly.XBoolean
														.convertStringToBoolean(value);
												this
														.setBooleanValue(booleanValue);
											} catch (d) {
												messages
														.addError(
																sap.firefly.ErrorCodes.PARSING_ERROR_BOOLEAN_VALUE,
																"Cannot parse boolean value");
											}
										} else {
											if (valueType === sap.firefly.XValueType.DATE) {
												try {
													dateValue = sap.firefly.XDate
															.createDateFromString(
																	value,
																	sap.firefly.XValueFormat.ISO_DATE);
													if (dateValue === null) {
														messages
																.addError(
																		sap.firefly.ErrorCodes.PARSING_ERROR_DATE_VALUE,
																		"Cannot parse date value");
													} else {
														this
																.setDateValue(dateValue);
													}
												} catch (e) {
													messages
															.addError(
																	sap.firefly.ErrorCodes.PARSING_ERROR_DATE_VALUE,
																	"Cannot parse date value");
												}
											} else {
												if (valueType === sap.firefly.XValueType.TIME) {
													try {
														timeValue = sap.firefly.XTime
																.createTimeFromString(
																		value,
																		sap.firefly.XValueFormat.ISO_DATE);
														this
																.setTimeValue(timeValue);
													} catch (f) {
														messages
																.addError(
																		sap.firefly.ErrorCodes.PARSING_ERROR_TIME_VALUE,
																		"Cannot parse time value");
													}
												} else {
													if (valueType === sap.firefly.XValueType.DATE_TIME) {
														try {
															dateTimeValue = sap.firefly.XDateTime
																	.createDateTimeFromString(
																			value,
																			sap.firefly.XValueFormat.ISO_DATE);
															if (dateTimeValue === null) {
																messages
																		.addError(
																				sap.firefly.ErrorCodes.PARSING_ERROR_DATE_TIME_VALUE,
																				"Cannot parse date time value");
															} else {
																this
																		.setDateTimeValue(dateTimeValue);
															}
														} catch (g) {
															messages
																	.addError(
																			sap.firefly.ErrorCodes.PARSING_ERROR_DATE_TIME_VALUE,
																			"Cannot parse date time value");
														}
													} else {
														if (valueType === sap.firefly.XValueType.TIMESPAN) {
															try {
																timespan = sap.firefly.XLong
																		.convertStringToLong(value);
																timeSpanValue = sap.firefly.XTimeSpan
																		.create(timespan);
																this
																		.setTimeSpanValue(timeSpanValue);
															} catch (h) {
																messages
																		.addError(
																				sap.firefly.ErrorCodes.PARSING_ERROR_TIMESPAN,
																				"Cannot parse timespan value");
															}
														} else {
															if (valueType
																	.isSpatial()) {
																geometryType = null;
																try {
																	geometryValue = sap.firefly.XGeometryValue
																			.createGeometryValueWithWkt(value);
																	if (geometryValue === null) {
																		throw sap.firefly.XException
																				.createRuntimeException("Cannot parse spatial value");
																	}
																	geometryType = geometryValue
																			.getValueType();
																	if (geometryType === sap.firefly.XValueType.POINT) {
																		this
																				.setPointValue(geometryValue);
																	} else {
																		if (geometryType === sap.firefly.XValueType.MULTI_POINT) {
																			this
																					.setMultiPointValue(geometryValue);
																		} else {
																			if (geometryType === sap.firefly.XValueType.LINE_STRING) {
																				this
																						.setLineStringValue(geometryValue);
																			} else {
																				if (geometryType === sap.firefly.XValueType.MULTI_LINE_STRING) {
																					this
																							.setMultiLineStringValue(geometryValue);
																				} else {
																					if (geometryType === sap.firefly.XValueType.POLYGON) {
																						this
																								.setPolygonValue(geometryValue);
																					} else {
																						this
																								.setMultiPolygonValue(geometryValue);
																					}
																				}
																			}
																		}
																	}
																} catch (i) {
																	message = sap.firefly.XStringBuffer
																			.create();
																	if (geometryType === null) {
																		message
																				.append("Coudn't parse value");
																	} else {
																		message
																				.append(
																						"Expected valuetype '")
																				.append(
																						this.m_type
																								.getName())
																				.append(
																						"' but got '")
																				.append(
																						geometryType
																								.getName())
																				.append(
																						"' instead.");
																	}
																	messages
																			.addError(
																					sap.firefly.ErrorCodes.INVALID_DATATYPE,
																					message
																							.toString());
																	message
																			.releaseObject();
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
						return messages;
					},
					toString : function() {
						return this.getStringValue();
					},
					setXValue : function(value) {
						sap.firefly.XValueAccess.copy(sap.firefly.XValueAccess
								.createWithValue(value), this);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.DispatcherSingleThread",
				sap.firefly.DfDispatcher,
				{
					$statics : {
						create : function() {
							var object = new sap.firefly.DispatcherSingleThread();
							object.setup();
							return object;
						}
					},
					m_procTimeReceiverList : null,
					m_timeoutItems : null,
					m_syncLock : false,
					m_countDown : 0,
					setup : function() {
						this.m_procTimeReceiverList = sap.firefly.XList
								.create();
						this.m_timeoutItems = sap.firefly.XList.create();
						this.m_countDown = -1;
					},
					releaseObject : function() {
						this.m_procTimeReceiverList = null;
						this.m_timeoutItems = null;
					},
					process : function() {
						var needsMoreProcessing = true;
						var isEnabled = true;
						var current;
						var i;
						var currentTimeoutItem;
						var now;
						while ((needsMoreProcessing) && (isEnabled)) {
							if (this.m_countDown !== -1) {
								if (this.m_countDown === 0) {
									isEnabled = false;
								} else {
									this.m_countDown--;
								}
							}
							if (this.m_syncLock === false) {
								needsMoreProcessing = false;
								this.m_syncLock = true;
								i = 0;
								while (i < this.m_procTimeReceiverList.size()) {
									current = this.m_procTimeReceiverList
											.get(i);
									current
											.processSynchronization(sap.firefly.SyncType.NON_BLOCKING);
									if (current.getSyncState() !== sap.firefly.SyncState.IN_SYNC) {
										needsMoreProcessing = true;
										i++;
									} else {
										this.m_procTimeReceiverList.removeAt(i);
									}
								}
								now = sap.firefly.XSystemUtils
										.getCurrentTimeInMilliseconds();
								for (i = this.m_timeoutItems.size() - 1; i >= 0; i--) {
									if (this.m_timeoutItems.size() > i) {
										currentTimeoutItem = this.m_timeoutItems
												.get(i);
										if (currentTimeoutItem.isMatching(now)) {
											currentTimeoutItem.execute();
											this.m_timeoutItems
													.removeElement(currentTimeoutItem);
										}
									}
								}
								if (this.m_timeoutItems.size() > 0) {
									needsMoreProcessing = true;
								}
								this.m_syncLock = false;
							} else {
								throw sap.firefly.XException
										.createIllegalStateException("Sync lock");
							}
						}
					},
					registerProcessingTimeReceiver : function(
							processingTimeReceiver) {
						if (this.m_procTimeReceiverList
								.contains(processingTimeReceiver) === false) {
							this.m_procTimeReceiverList
									.add(processingTimeReceiver);
						}
					},
					unregisterProcessingTimeReceiver : function(
							processingTimeReceiver) {
						if (this.m_procTimeReceiverList !== null) {
							this.m_procTimeReceiverList
									.removeElement(processingTimeReceiver);
						}
					},
					getSyncState : function() {
						var state = sap.firefly.SyncState.IN_SYNC;
						var current;
						var currentState;
						var i;
						for (i = 0; i < this.m_procTimeReceiverList.size(); i++) {
							current = this.m_procTimeReceiverList.get(i);
							currentState = current.getSyncState();
							if (currentState.getLevel() < state.getLevel()) {
								state = currentState;
							}
						}
						return state;
					},
					getProcessingTimeReceiverCount : function() {
						return this.m_procTimeReceiverList.size();
					},
					registerTimer : function(delayMilliseconds, listener,
							customIdentifier) {
						var timeout = sap.firefly.TimerItem.create(
								delayMilliseconds, listener, customIdentifier);
						this.m_timeoutItems.add(timeout);
						return timeout;
					},
					unregisterTimer : function(handle) {
						this.m_timeoutItems.removeElement(handle);
					},
					shutdown : function() {
						if (this.m_countDown === -1) {
							this.m_countDown = 1000;
						}
					}
				});
$Firefly.createClass("sap.firefly.RegistrationEntry", sap.firefly.DfNameObject,
		{
			$statics : {
				create : function() {
					var entry = new sap.firefly.RegistrationEntry();
					return entry;
				}
			},
			m_class : null,
			m_serviceTypeName : null,
			releaseObject : function() {
				this.m_class = null;
				this.m_serviceTypeName = null;
				sap.firefly.RegistrationEntry.$superclass.releaseObject
						.call(this);
			},
			setXClass : function(clazz) {
				this.m_class = clazz;
			},
			getXClass : function() {
				return this.m_class;
			},
			getServiceTypeName : function() {
				return this.m_serviceTypeName;
			},
			setServiceTypeName : function(name) {
				this.m_serviceTypeName = name;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.XArray2Dim",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(dim0count, dim1count) {
							var object = new sap.firefly.XArray2Dim();
							object.setup(dim0count, dim1count, null);
							return object;
						}
					},
					m_dim0count : 0,
					m_dim1count : 0,
					m_storage : null,
					setup : function(dim0count, dim1count, storage) {
						var size;
						this.m_dim0count = dim0count;
						this.m_dim1count = dim1count;
						if (storage === null) {
							size = dim0count * dim1count;
							this.m_storage = sap.firefly.XArray.create(size);
						} else {
							this.m_storage = storage;
						}
					},
					releaseObject : function() {
						this.m_dim0count = -1;
						this.m_dim1count = -1;
						this.m_storage = sap.firefly.XObject
								.releaseIfNotNull(this.m_storage);
						sap.firefly.XArray2Dim.$superclass.releaseObject
								.call(this);
					},
					createArrayCopy : function() {
						var copy = this.m_storage.createArrayCopy();
						var object = new sap.firefly.XArray2Dim();
						object.setup(this.m_dim0count, this.m_dim1count, copy);
						return object;
					},
					clear : function() {
						this.m_storage.clear();
					},
					size : function() {
						return this.m_dim0count * this.m_dim1count;
					},
					isEmpty : function() {
						var idx0;
						var idx1;
						for (idx0 = 0; idx0 < this.m_dim0count; idx0++) {
							for (idx1 = 0; idx1 < this.m_dim0count; idx1++) {
								if (this.m_storage.get(idx0
										+ (idx1 * this.m_dim0count)) !== null) {
									return false;
								}
							}
						}
						return true;
					},
					hasElements : function() {
						return !this.isEmpty();
					},
					setByIndices : function(index0, index1, element) {
						var pos;
						if (index0 >= this.m_dim0count) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Index0 is too big");
						}
						if (index1 >= this.m_dim1count) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Index1 is too big");
						}
						pos = index0 + (index1 * this.m_dim0count);
						this.m_storage.set(pos, element);
					},
					getByIndices : function(index0, index1) {
						var pos;
						if ((index0 >= this.m_dim0count)
								|| (index1 >= this.m_dim1count)) {
							return null;
						}
						pos = index0 + (index1 * this.m_dim0count);
						return this.m_storage.get(pos);
					},
					size0 : function() {
						return this.m_dim0count;
					},
					size1 : function() {
						return this.m_dim1count;
					},
					toString : function() {
						var stringBuffer = sap.firefly.XStringBuffer.create();
						var index1;
						var index0;
						var element;
						stringBuffer.append("Size0: ");
						stringBuffer.appendInt(this.m_dim0count);
						stringBuffer.appendNewLine();
						stringBuffer.append("Size1: ");
						stringBuffer.appendInt(this.m_dim1count);
						stringBuffer.appendNewLine();
						stringBuffer.append("Values:");
						for (index1 = 0; index1 < this.m_dim1count; index1++) {
							stringBuffer.appendNewLine();
							stringBuffer.append("[");
							for (index0 = 0; index0 < this.m_dim0count; index0++) {
								element = this.getByIndices(index0, index1);
								if (element !== null) {
									stringBuffer.append(element.toString());
								} else {
									stringBuffer.append("null");
								}
								if (index0 < (this.m_dim0count - 1)) {
									stringBuffer.append(", ");
								}
							}
							stringBuffer.append("]");
						}
						return stringBuffer.toString();
					}
				});
$Firefly.createClass("sap.firefly.ChildSetState", sap.firefly.XConstant, {
	$statics : {
		NONE : null,
		INITIAL : null,
		INCOMPLETE : null,
		COMPLETE : null,
		staticSetup : function() {
			sap.firefly.ChildSetState.NONE = sap.firefly.ChildSetState
					.create("None");
			sap.firefly.ChildSetState.INITIAL = sap.firefly.ChildSetState
					.create("Initial");
			sap.firefly.ChildSetState.INCOMPLETE = sap.firefly.ChildSetState
					.create("Incomplete");
			sap.firefly.ChildSetState.COMPLETE = sap.firefly.ChildSetState
					.create("Complete");
		},
		create : function(name) {
			var newConstant = new sap.firefly.ChildSetState();
			newConstant.setName(name);
			return newConstant;
		}
	},
	needsMoreFetching : function() {
		return (this === sap.firefly.ChildSetState.INITIAL)
				|| (this === sap.firefly.ChildSetState.INCOMPLETE);
	}
});
$Firefly.createClass("sap.firefly.XHierarchyElement",
		sap.firefly.DfNameTextObject, {
			$statics : {
				createHierarchyElement : function(componentType, name, text) {
					var newObj = new sap.firefly.XHierarchyElement();
					newObj.setName(name);
					newObj.setText(text);
					newObj.m_componentType = componentType;
					return newObj;
				}
			},
			m_componentType : null,
			getComponentType : function() {
				return this.m_componentType;
			},
			isNode : function() {
				return false;
			},
			isLeaf : function() {
				return !this.isNode();
			},
			getTagValue : function(tagName) {
				return null;
			},
			getContentElement : function() {
				return this;
			},
			getContentConstant : function() {
				return null;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.XMessage",
				sap.firefly.DfNameTextObject,
				{
					$statics : {
						createMessage : function(originLayer, severity, code,
								message, errorCause, withStackTrace,
								extendedInfo) {
							var msg = new sap.firefly.XMessage();
							msg.setupMsg(originLayer, severity, code, message,
									errorCause, withStackTrace, extendedInfo);
							return msg;
						},
						createError : function(originLayer, message,
								errorCause, withStackTrace, extendedInfo) {
							return sap.firefly.XMessage.createMessage(
									originLayer, sap.firefly.Severity.ERROR,
									sap.firefly.ErrorCodes.OTHER_ERROR,
									message, errorCause, withStackTrace,
									extendedInfo);
						},
						createErrorWithCode : function(originLayer, errorCode,
								message, errorCause, withStackTrace,
								extendedInfo) {
							return sap.firefly.XMessage.createMessage(
									originLayer, sap.firefly.Severity.ERROR,
									errorCode, message, errorCause,
									withStackTrace, extendedInfo);
						}
					},
					m_severity : null,
					m_originLayer : null,
					m_errorCause : null,
					m_stackTrace : null,
					m_extendedInfo : null,
					m_extendedInfoType : null,
					m_code : 0,
					setupMsg : function(originLayer, severity, errorCode,
							message, errorCause, withStackTrace, nativeCause) {
						this.setText(message);
						this.m_originLayer = originLayer;
						this.m_severity = severity;
						this.m_code = errorCode;
						this.m_extendedInfoType = sap.firefly.ExtendedInfoType.UNKNOWN;
						this.m_errorCause = errorCause;
						if (withStackTrace
								&& sap.firefly.XStackTrace.supportsStackTrace()) {
							this.m_stackTrace = sap.firefly.XStackTrace
									.create(3);
						}
						this.m_extendedInfo = nativeCause;
					},
					releaseObject : function() {
						this.m_errorCause = null;
						this.m_extendedInfo = null;
						this.m_originLayer = null;
						this.m_severity = null;
						this.m_stackTrace = sap.firefly.XObject
								.releaseIfNotNull(this.m_stackTrace);
						sap.firefly.XMessage.$superclass.releaseObject
								.call(this);
					},
					setExtendendInfo : function(extendedInfo) {
						this.m_extendedInfo = extendedInfo;
					},
					setExtendendInfoType : function(extendedInfoType) {
						this.m_extendedInfoType = extendedInfoType;
					},
					hasErrorCause : function() {
						return this.m_errorCause !== null;
					},
					getErrorCause : function() {
						return this.m_errorCause;
					},
					hasStackTrace : function() {
						return this.m_stackTrace !== null;
					},
					getStackTrace : function() {
						return this.m_stackTrace;
					},
					hasExtendedInfo : function() {
						return this.m_extendedInfo !== null;
					},
					getExtendedInfo : function() {
						return this.m_extendedInfo;
					},
					hasCode : function() {
						return this.m_code !== sap.firefly.ErrorCodes.OTHER_ERROR;
					},
					getCode : function() {
						return this.m_code;
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.ERROR_VALUE;
					},
					getSeverity : function() {
						return this.m_severity;
					},
					getOriginLayer : function() {
						return this.m_originLayer;
					},
					resetValue : function(value) {
						var valueMessage;
						var stackTrace;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if (this.getValueType() !== value.getValueType()) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						valueMessage = value;
						this.m_code = valueMessage.getCode();
						this.m_errorCause = valueMessage.getErrorCause();
						this.m_extendedInfo = valueMessage.getExtendedInfo();
						this.m_severity = valueMessage.getSeverity();
						stackTrace = valueMessage.getStackTrace();
						if (stackTrace !== null) {
							this.m_stackTrace = stackTrace.clone();
						}
					},
					clone : function() {
						return sap.firefly.XMessage
								.createMessage(this.m_originLayer,
										this.m_severity, this.m_code, this
												.getText(), this.m_errorCause,
										this.m_stackTrace !== null,
										this.m_extendedInfo);
					},
					isEqualTo : function(other) {
						var otherMessage;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						otherMessage = other;
						if (this.getSeverity().isEqualTo(
								otherMessage.getSeverity()) === false) {
							return false;
						}
						if (this.getCode() !== otherMessage.getCode()) {
							return false;
						}
						return true;
					},
					getStringRepresentation : function() {
						return this.toString();
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var extendedInfoType;
						buffer.append(this.m_severity.getName());
						buffer.append(" [");
						buffer.append(this.m_originLayer.getName());
						buffer.append("]");
						buffer.append(":");
						if (this.m_code !== sap.firefly.ErrorCodes.OTHER_ERROR) {
							buffer.append(" (#");
							buffer.appendInt(this.m_code);
							buffer.append(")");
						}
						if (this.getText() !== null) {
							buffer.append(" ");
							buffer.append(this.getText());
						}
						if (this.getExtendedInfo() !== null) {
							extendedInfoType = this.getExtendedInfoType();
							if ((extendedInfoType !== null)
									&& (extendedInfoType !== sap.firefly.ExtendedInfoType.UNKNOWN)) {
								buffer.append(" ");
								buffer.append(extendedInfoType.getName());
							}
							buffer.append(" [");
							buffer.append(this.getExtendedInfo().toString());
							buffer.append("]");
						}
						return buffer.toString();
					},
					getExtendedInfoType : function() {
						return this.m_extendedInfoType;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PrElementType",
				sap.firefly.XConstant,
				{
					$statics : {
						STRUCTURE : null,
						LIST : null,
						STRING : null,
						INTEGER : null,
						LONG : null,
						DOUBLE : null,
						BOOLEAN : null,
						OBJECT : null,
						THE_NULL : null,
						ANY : null,
						create : function(name, isNumber) {
							var newConstant = new sap.firefly.PrElementType();
							newConstant.setName(name);
							newConstant.m_isNumber = isNumber;
							return newConstant;
						},
						staticSetup : function() {
							sap.firefly.PrElementType.STRUCTURE = sap.firefly.PrElementType
									.create("Structure", false);
							sap.firefly.PrElementType.LIST = sap.firefly.PrElementType
									.create("List", false);
							sap.firefly.PrElementType.STRING = sap.firefly.PrElementType
									.create("String", false);
							sap.firefly.PrElementType.INTEGER = sap.firefly.PrElementType
									.create("Integer", true);
							sap.firefly.PrElementType.LONG = sap.firefly.PrElementType
									.create("Long", true);
							sap.firefly.PrElementType.DOUBLE = sap.firefly.PrElementType
									.create("Double", true);
							sap.firefly.PrElementType.BOOLEAN = sap.firefly.PrElementType
									.create("Boolean", false);
							sap.firefly.PrElementType.OBJECT = sap.firefly.PrElementType
									.create("Object", false);
							sap.firefly.PrElementType.THE_NULL = sap.firefly.PrElementType
									.create("Null", false);
							sap.firefly.PrElementType.ANY = sap.firefly.PrElementType
									.create("Any", false);
						},
						mapToElementType : function(str) {
							if (sap.firefly.XString.isEqual(str, "Structure")) {
								return sap.firefly.PrElementType.STRUCTURE;
							} else {
								if (sap.firefly.XString.isEqual(str, "List")) {
									return sap.firefly.PrElementType.LIST;
								} else {
									if (sap.firefly.XString.isEqual(str,
											"String")) {
										return sap.firefly.PrElementType.STRING;
									} else {
										if (sap.firefly.XString.isEqual(str,
												"Integer")) {
											return sap.firefly.PrElementType.INTEGER;
										} else {
											if (sap.firefly.XString.isEqual(
													str, "Long")) {
												return sap.firefly.PrElementType.LONG;
											} else {
												if (sap.firefly.XString
														.isEqual(str, "Double")) {
													return sap.firefly.PrElementType.DOUBLE;
												} else {
													if (sap.firefly.XString
															.isEqual(str,
																	"OBJECT")) {
														return sap.firefly.PrElementType.OBJECT;
													} else {
														if (sap.firefly.XString
																.isEqual(str,
																		"Null")) {
															return sap.firefly.PrElementType.THE_NULL;
														}
													}
												}
											}
										}
									}
								}
							}
							return sap.firefly.PrElementType.ANY;
						}
					},
					m_isNumber : false,
					isNumber : function() {
						return this.m_isNumber;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.PrElement",
				sap.firefly.XJson,
				{
					$statics : {
						deepCopyElement : function(origin) {
							var type;
							if (origin === null) {
								return null;
							}
							type = origin.getType();
							if (type === sap.firefly.PrElementType.STRUCTURE) {
								return sap.firefly.PrStructure
										.createDeepCopy(origin);
							} else {
								if (type === sap.firefly.PrElementType.LIST) {
									return sap.firefly.PrList
											.createDeepCopy(origin);
								}
							}
							return origin.getPermaCopy();
						}
					},
					getElement : function() {
						return this;
					},
					asList : function() {
						return null;
					},
					asStructure : function() {
						return null;
					},
					asString : function() {
						return null;
					},
					asNumber : function() {
						return null;
					},
					asInteger : function() {
						return null;
					},
					asLong : function() {
						return null;
					},
					asDouble : function() {
						return null;
					},
					asBoolean : function() {
						return null;
					},
					asObject : function() {
						return null;
					},
					asNull : function() {
						return null;
					},
					getType : function() {
						return null;
					},
					getValueType : function() {
						if (this.getType() === sap.firefly.PrElementType.STRUCTURE) {
							return sap.firefly.XValueType.STRUCTURE;
						}
						return null;
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getPermaCopy : function() {
						return this;
					},
					isStructure : function() {
						return this.getType() === sap.firefly.PrElementType.STRUCTURE;
					},
					isList : function() {
						return this.getType() === sap.firefly.PrElementType.LIST;
					},
					isString : function() {
						return this.getType() === sap.firefly.PrElementType.STRING;
					},
					isInteger : function() {
						return this.getType() === sap.firefly.PrElementType.INTEGER;
					},
					isDouble : function() {
						return this.getType() === sap.firefly.PrElementType.DOUBLE;
					},
					isLong : function() {
						return this.getType() === sap.firefly.PrElementType.LONG;
					},
					isObject : function() {
						return this.getType() === sap.firefly.PrElementType.OBJECT;
					},
					isBoolean : function() {
						return this.getType() === sap.firefly.PrElementType.BOOLEAN;
					},
					isNumeric : function() {
						return this.isLong() || this.isDouble()
								|| this.isInteger();
					},
					isEqualTo : function(other) {
						var otherElement;
						var myType;
						var otherType;
						var myList;
						var otherList;
						var sizeList;
						var i;
						var myListElement;
						var otherListElement;
						var myStructure;
						var otherStructure;
						var myNames;
						var otherNames;
						var sizeStruct;
						var k;
						var myName;
						var myStructureElement;
						var otherStructureElement;
						if (other === null) {
							return false;
						}
						otherElement = other;
						myType = this.getType();
						otherType = otherElement.getType();
						if (myType.isNumber() && otherType.isNumber()) {
							return this.asNumber().getDoubleValue() === otherElement
									.asNumber().getDoubleValue();
						}
						if (myType !== otherType) {
							return false;
						}
						if (myType === sap.firefly.PrElementType.BOOLEAN) {
							return (this).getBooleanValue() === (otherElement)
									.getBooleanValue();
						} else {
							if (myType === sap.firefly.PrElementType.INTEGER) {
								return (this).getIntegerValue() === (otherElement)
										.getIntegerValue();
							} else {
								if (myType === sap.firefly.PrElementType.LONG) {
									return (this).getLongValue() === (otherElement)
											.getLongValue();
								} else {
									if (myType === sap.firefly.PrElementType.DOUBLE) {
										return (this).getDoubleValue() === (otherElement)
												.getDoubleValue();
									} else {
										if (myType === sap.firefly.PrElementType.STRING) {
											return sap.firefly.XString.isEqual(
													(this).getStringValue(),
													(otherElement)
															.getStringValue());
										} else {
											if (myType === sap.firefly.PrElementType.OBJECT) {
												return this.asObject()
														.getObjectValue() === otherElement
														.asObject()
														.getObjectValue();
											} else {
												if (myType === sap.firefly.PrElementType.THE_NULL) {
													return true;
												}
											}
										}
									}
								}
							}
						}
						if (myType === sap.firefly.PrElementType.LIST) {
							myList = this;
							otherList = otherElement;
							sizeList = myList.size();
							if (sizeList !== otherList.size()) {
								return false;
							}
							for (i = 0; i < sizeList; i++) {
								myListElement = myList.getElementByIndex(i);
								otherListElement = otherList
										.getElementByIndex(i);
								if ((myListElement === null)
										|| (otherListElement === null)) {
									return myListElement === otherListElement;
								} else {
									if (myListElement
											.isEqualTo(otherListElement) === false) {
										return false;
									}
								}
							}
						} else {
							if (myType === sap.firefly.PrElementType.STRUCTURE) {
								myStructure = this;
								otherStructure = otherElement;
								myNames = myStructure
										.getStructureElementNamesSorted();
								otherNames = otherStructure
										.getStructureElementNamesSorted();
								sizeStruct = myNames.size();
								if (sizeStruct !== otherNames.size()) {
									return false;
								}
								for (k = 0; k < sizeStruct; k++) {
									myName = myNames.get(k);
									if (sap.firefly.XString.isEqual(myName,
											otherNames.get(k)) === false) {
										return false;
									}
									myStructureElement = myStructure
											.getElementByName(myName);
									otherStructureElement = otherStructure
											.getElementByName(myName);
									if (myStructureElement
											.isEqualTo(otherStructureElement) === false) {
										return false;
									}
								}
							} else {
								throw sap.firefly.XException
										.createIllegalStateException("Unknown type");
							}
						}
						return true;
					},
					resetValue : function(value) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					clone : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getStringRepresentation : function() {
						return sap.firefly.PrToString.serialize(this, true,
								false, 0);
					},
					toString : function() {
						return sap.firefly.PrToString.serialize(this, true,
								false, 0);
					}
				});
$Firefly.createClass("sap.firefly.AbstractGeometry", sap.firefly.XObject, {
	m_srid : null,
	releaseObject : function() {
		this.m_srid = sap.firefly.XObject.releaseIfNotNull(this.m_srid);
		sap.firefly.AbstractGeometry.$superclass.releaseObject.call(this);
	},
	isEqualTo : function(other) {
		var xOther;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		if (this.getValueType() !== (other).getValueType()) {
			return false;
		}
		xOther = other;
		if (this.getSrid() === null) {
			if (xOther.getSrid() !== null) {
				return false;
			}
		} else {
			if (this.getSrid().isEqualTo(xOther.getSrid()) === false) {
				return false;
			}
		}
		return true;
	},
	getStringRepresentation : function() {
		return this.toWKT();
	},
	getSrid : function() {
		return this.m_srid;
	},
	setSrid : function(srid) {
		this.m_srid = srid;
	},
	getComponentType : function() {
	},
	getValueType : function() {
	},
	resetValue : function(arg1) {
	},
	toWKT : function() {
	}
});
$Firefly
		.createClass(
				"sap.firefly.DfSynchronizer",
				sap.firefly.MessageManager,
				{
					m_syncState : null,
					m_syncType : null,
					m_isSyncCanceled : false,
					m_session : null,
					setupSynchronizer : function(session) {
						this.setup();
						this.m_session = session;
						this.m_syncState = sap.firefly.SyncState.OUT_OF_SYNC;
						this.m_syncType = null;
					},
					releaseObject : function() {
						this.m_syncState = null;
						this.m_syncType = null;
						sap.firefly.DfSynchronizer.$superclass.releaseObject
								.call(this);
					},
					resetSyncState : function() {
						if (this.m_syncState === sap.firefly.SyncState.IN_SYNC) {
							this.m_syncState = sap.firefly.SyncState.OUT_OF_SYNC;
							this.m_isSyncCanceled = false;
							this.m_syncType = null;
							this.clearMessages();
							return true;
						} else {
							if (this.m_syncState === sap.firefly.SyncState.PROCESSING) {
								throw sap.firefly.XException
										.createIllegalStateException("Action is still in processing, it cannot be reset.");
							} else {
								return false;
							}
						}
					},
					processSyncGeneric : function(syncType, listener,
							customIdentifier) {
						var activeSyncType;
						var continueProcessing;
						if (this.getSyncState() === sap.firefly.SyncState.OUT_OF_SYNC) {
							this.attachListener(listener, false,
									customIdentifier);
							activeSyncType = this
									.startSyncAndClearErrors(syncType);
							if (activeSyncType !== sap.firefly.SyncType.DELAYED) {
								continueProcessing = this
										.processSynchronization(activeSyncType);
								if (continueProcessing === false) {
									this.endSync();
								}
							}
						}
					},
					attachListener : function(listener, isSpecific,
							customIdentifier) {
						if (listener !== null) {
							throw sap.firefly.XException
									.createUnsupportedOperationException();
						}
					},
					processSynchronization : function(syncType) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					startSyncAndClearErrors : function(syncType) {
						var activeSyncType;
						this.addProfileStep("processSynchronization");
						this.m_isSyncCanceled = false;
						this.clearMessages();
						activeSyncType = this.setActiveSyncType(syncType);
						if (syncType !== sap.firefly.SyncType.DELAYED) {
							this.setSyncState(sap.firefly.SyncState.PROCESSING);
						}
						return activeSyncType;
					},
					getSyncState : function() {
						return this.m_syncState;
					},
					endSync : function() {
						if (this.m_syncState !== sap.firefly.SyncState.IN_SYNC) {
							this.endProfileStep();
							this.m_syncState = sap.firefly.SyncState.IN_SYNC;
							this.onInSync();
						}
						this.setActiveSyncType(null);
					},
					setSyncState : function(syncState) {
						if (this.m_syncState !== syncState) {
							this.endProfileStep();
							this.m_syncState = syncState;
							if (syncState === sap.firefly.SyncState.IN_SYNC) {
								this.onInSync();
							}
						}
					},
					isSyncCanceled : function() {
						return this.m_isSyncCanceled;
					},
					cancelSynchronization : function() {
						this.endProfileStep();
						this.m_isSyncCanceled = true;
					},
					getActiveSyncType : function() {
						return this.m_syncType;
					},
					setActiveSyncType : function(syncType) {
						if ((this.m_syncType === null)
								|| (this.m_syncType === sap.firefly.SyncType.DELAYED)) {
							if (syncType !== null) {
								this.m_syncType = syncType;
							} else {
								this.m_syncType = this.getSession()
										.getDefaultSyncType();
							}
						}
						return this.m_syncType;
					},
					onInSync : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getSession : function() {
						return this.m_session;
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var activeSyncType;
						var summary;
						buffer.append("SyncState: ");
						buffer.append(this.m_syncState.toString());
						activeSyncType = this.getActiveSyncType();
						if (activeSyncType !== null) {
							buffer.appendNewLine();
							buffer.append("SyncType: ");
							buffer.append(activeSyncType.toString());
						}
						summary = this.getSummary();
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(summary)) {
							buffer.append(summary);
						}
						return buffer.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ListenerType",
				sap.firefly.XConstant,
				{
					$statics : {
						SPECIFIC : null,
						SYNC_LISTENER : null,
						OLAP_COMPONENT_CHANGED : null,
						staticSetup : function() {
							sap.firefly.ListenerType.SPECIFIC = sap.firefly.ListenerType
									.create("Specific");
							sap.firefly.ListenerType.SYNC_LISTENER = sap.firefly.ListenerType
									.create("SyncListener");
							sap.firefly.ListenerType.OLAP_COMPONENT_CHANGED = sap.firefly.ListenerType
									.create("OlapComponentChanged");
						},
						create : function(name) {
							var drillState = new sap.firefly.ListenerType();
							drillState.setName(name);
							return drillState;
						}
					}
				});
$Firefly.createClass("sap.firefly.WorkingTaskHandle", sap.firefly.XObject, {
	$statics : {
		create : function(manager, task) {
			var handle = new sap.firefly.WorkingTaskHandle();
			handle.setupWorkingTaskHandle(manager, task);
			return handle;
		}
	},
	m_outputChunks : null,
	m_inputChunks : null,
	m_isCancellingRequested : false,
	m_task : null,
	m_workingTaskManager : null,
	setupWorkingTaskHandle : function(manager, task) {
		this.m_workingTaskManager = manager;
		this.m_task = task;
		this.m_outputChunks = sap.firefly.XList.create();
		this.m_inputChunks = sap.firefly.XList.create();
	},
	releaseObject : function() {
		this.m_inputChunks = null;
		this.m_outputChunks = null;
		this.m_task = null;
		this.m_workingTaskManager = null;
		sap.firefly.WorkingTaskHandle.$superclass.releaseObject.call(this);
	},
	processSynchronization : function(syncType) {
		this.m_workingTaskManager.addHandleToProcessingQueue(this);
		if (syncType === sap.firefly.SyncType.BLOCKING) {
			this.m_workingTaskManager.waitUntilFinished(this, syncType);
			return false;
		}
		return true;
	},
	processWorkerThread : function() {
		var task = this.getTask();
		task.processInputOnWorkerThread(this);
	},
	processMainThread : function() {
		var task = this.getTask();
		task.processOutputOnMainThread(this);
	},
	isFinished : function() {
		var task = this.getTask();
		var isFinished = task.isFinishedOnWorkerThread(this);
		var hasNextInputChunk = this.hasNextInputChunk();
		var hasNextOutputChunk = this.hasNextOutputChunk();
		return isFinished && (hasNextInputChunk === false)
				&& (hasNextOutputChunk === false);
	},
	isCancellingRequested : function() {
		return this.m_isCancellingRequested;
	},
	requestCancelling : function() {
		this.m_isCancellingRequested = true;
	},
	getTask : function() {
		return this.m_task;
	},
	getInputChunks : function() {
		return this.m_inputChunks;
	},
	addInputChunk : function(inputChunk) {
		this.m_inputChunks.add(inputChunk);
	},
	hasNextInputChunk : function() {
		return this.m_inputChunks.size() > 0;
	},
	nextInputChunk : function() {
		var inputChunk = this.m_inputChunks.get(0);
		this.m_inputChunks.removeAt(0);
		return inputChunk;
	},
	publishOutputChunk : function(outputChunk) {
		this.m_outputChunks.add(outputChunk);
	},
	hasNextOutputChunk : function() {
		return this.m_outputChunks.size() > 0;
	},
	nextOutputChunk : function() {
		var outputChunk = this.m_outputChunks.get(0);
		this.m_outputChunks.removeAt(0);
		return outputChunk;
	},
	getSyncState : function() {
		if (this.isFinished()) {
			return sap.firefly.SyncState.IN_SYNC;
		}
		return sap.firefly.SyncState.PROCESSING;
	}
});
$Firefly.createClass("sap.firefly.XLinkedHashMapByString", sap.firefly.XObject,
		{
			$statics : {
				create : function() {
					var hashMap = new sap.firefly.XLinkedHashMapByString();
					hashMap.m_order = sap.firefly.XListOfString.create();
					hashMap.m_storage = sap.firefly.XHashMapByString.create();
					return hashMap;
				}
			},
			m_storage : null,
			m_order : null,
			releaseObject : function() {
				this.m_order = sap.firefly.XObject
						.releaseIfNotNull(this.m_order);
				this.m_storage = sap.firefly.XObject
						.releaseIfNotNull(this.m_storage);
				sap.firefly.XLinkedHashMapByString.$superclass.releaseObject
						.call(this);
			},
			clear : function() {
				this.m_storage.clear();
				this.m_order.clear();
			},
			size : function() {
				return this.m_order.size();
			},
			isEmpty : function() {
				return this.m_storage.isEmpty();
			},
			hasElements : function() {
				return this.m_storage.hasElements();
			},
			containsKey : function(key) {
				return this.m_storage.containsKey(key);
			},
			contains : function(element) {
				return this.m_storage.contains(element);
			},
			getByKey : function(key) {
				return this.m_storage.getByKey(key);
			},
			remove : function(key) {
				if (key === null) {
					return;
				}
				this.m_storage.remove(key);
				this.m_order.removeElement(key);
			},
			clone : function() {
				return this.createMapByStringCopy();
			},
			createMapByStringCopy : function() {
				var copy = sap.firefly.XLinkedHashMapByString.create();
				var i;
				var next;
				for (i = 0; i < this.m_order.size(); i++) {
					next = this.m_order.get(i);
					copy.put(next, this.getByKey(next));
				}
				return copy;
			},
			getKeysAsReadOnlyListOfString : function() {
				return this.m_order.createListOfStringCopy();
			},
			getKeysAsIteratorOfString : function() {
				return this.m_storage.getKeysAsIteratorOfString();
			},
			putIfNotNull : function(key, element) {
				if (element !== null) {
					this.put(key, element);
				}
			},
			put : function(key, element) {
				if (key === null) {
					return;
				}
				if (!this.m_storage.containsKey(key)) {
					this.m_order.add(key);
				}
				this.m_storage.put(key, element);
			},
			getValuesAsReadOnlyList : function() {
				var list = sap.firefly.XList.create();
				var i;
				for (i = 0; i < this.m_order.size(); i++) {
					list.add(this.m_storage.getByKey(this.m_order.get(i)));
				}
				return list;
			},
			getIterator : function() {
				return this.getValuesAsReadOnlyList().getIterator();
			},
			isEqualTo : function(other) {
				var otherMap;
				var thisKeys;
				var thisValues;
				var otherKeys;
				var otherValues;
				var keyIdx;
				if (other === null) {
					return false;
				}
				if (this === other) {
					return true;
				}
				otherMap = other;
				if (this.size() !== otherMap.size()) {
					return false;
				}
				thisKeys = this.getKeysAsReadOnlyListOfString();
				thisValues = this.getValuesAsReadOnlyList();
				otherKeys = otherMap.getKeysAsReadOnlyListOfString();
				otherValues = otherMap.getValuesAsReadOnlyList();
				for (keyIdx = 0; keyIdx < thisKeys.size(); keyIdx++) {
					if (sap.firefly.XString.isEqual(thisKeys.get(keyIdx),
							otherKeys.get(keyIdx)) === false) {
						return false;
					}
					if (thisValues.get(keyIdx).isEqualTo(
							otherValues.get(keyIdx)) === false) {
						return false;
					}
				}
				return true;
			},
			toString : function() {
				return this.m_storage.toString();
			}
		});
$Firefly.createClass("sap.firefly.XSimpleMap", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var map = new sap.firefly.XSimpleMap();
			map.m_storage = sap.firefly.XList.create();
			return map;
		}
	},
	m_storage : null,
	releaseObject : function() {
		this.m_storage = sap.firefly.XObject.releaseIfNotNull(this.m_storage);
		sap.firefly.XSimpleMap.$superclass.releaseObject.call(this);
	},
	containsKey : function(key) {
		var i;
		var pair;
		var obj1;
		var obj2;
		for (i = 0; i < this.m_storage.size(); i++) {
			pair = this.m_storage.get(i);
			obj1 = pair.getFirstObject();
			obj2 = key;
			if (obj1 === obj2) {
				return true;
			}
		}
		return false;
	},
	getByKey : function(key) {
		var i;
		var pair;
		var obj1;
		var obj2;
		for (i = 0; i < this.m_storage.size(); i++) {
			pair = this.m_storage.get(i);
			obj1 = pair.getFirstObject();
			obj2 = key;
			if (obj1 === obj2) {
				return pair.getSecondObject();
			}
		}
		return null;
	},
	contains : function(element) {
		var i;
		var pair;
		var obj1;
		var obj2;
		for (i = 0; i < this.m_storage.size(); i++) {
			pair = this.m_storage.get(i);
			obj1 = pair.getSecondObject();
			obj2 = element;
			if (obj1 === obj2) {
				return true;
			}
		}
		return false;
	},
	getKeysAsIterator : function() {
		return this.getKeysAsReadOnlyList().getIterator();
	},
	getKeysAsReadOnlyList : function() {
		var list = sap.firefly.XList.create();
		var i;
		var pair;
		for (i = 0; i < this.m_storage.size(); i++) {
			pair = this.m_storage.get(i);
			list.add(pair.getFirstObject());
		}
		return list;
	},
	getIterator : function() {
		return this.getValuesAsReadOnlyList().getIterator();
	},
	getValuesAsReadOnlyList : function() {
		var list = sap.firefly.XList.create();
		var i;
		var pair;
		for (i = 0; i < this.m_storage.size(); i++) {
			pair = this.m_storage.get(i);
			list.add(pair.getSecondObject());
		}
		return list;
	},
	size : function() {
		return this.m_storage.size();
	},
	isEmpty : function() {
		return this.m_storage.size() === 0;
	},
	hasElements : function() {
		return this.m_storage.size() > 0;
	},
	clear : function() {
		this.m_storage.clear();
	},
	put : function(key, element) {
		var pair;
		this.remove(key);
		pair = sap.firefly.XPair.create(key, element);
		this.m_storage.add(pair);
	},
	remove : function(key) {
		var i;
		var pair;
		var obj1;
		var obj2;
		for (i = 0; i < this.m_storage.size(); i++) {
			pair = this.m_storage.get(i);
			obj1 = pair.getFirstObject();
			obj2 = key;
			if (obj1 === obj2) {
				this.m_storage.removeAt(i);
				break;
			}
		}
	},
	createMapCopy : function() {
		var map = sap.firefly.XSimpleMap.create();
		var i;
		var pair;
		for (i = 0; i < this.m_storage.size(); i++) {
			pair = this.m_storage.get(i);
			map.put(pair.getFirstObject(), pair.getSecondObject());
		}
		return map;
	}
});
$Firefly.createClass("sap.firefly.XWeakMap", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var hashMap = new sap.firefly.XWeakMap();
			hashMap.m_storage = sap.firefly.XHashMapByString.create();
			return hashMap;
		}
	},
	m_storage : null,
	releaseObject : function() {
		this.m_storage = sap.firefly.XObject.releaseIfNotNull(this.m_storage);
		sap.firefly.XWeakMap.$superclass.releaseObject.call(this);
	},
	clear : function() {
		this.m_storage.clear();
	},
	size : function() {
		return this.m_storage.size();
	},
	isEmpty : function() {
		return this.m_storage.isEmpty();
	},
	hasElements : function() {
		return this.m_storage.hasElements();
	},
	containsKey : function(key) {
		return this.m_storage.containsKey(key);
	},
	contains : function(element) {
		var values = this.getValuesAsReadOnlyList();
		return values.contains(element);
	},
	getByKey : function(key) {
		var weakRef;
		var hardRef;
		if (key === null) {
			return null;
		}
		weakRef = this.m_storage.getByKey(key);
		hardRef = sap.firefly.XWeakReferenceUtil.getHardRef(weakRef);
		return hardRef;
	},
	remove : function(key) {
		this.m_storage.remove(key);
	},
	clone : function() {
		return this.createMapByStringCopy();
	},
	createMapByStringCopy : function() {
		var copy = sap.firefly.XWeakMap.create();
		var iterator = this.getKeysAsIteratorOfString();
		var next;
		while (iterator.hasNext()) {
			next = iterator.next();
			copy.put(next, this.getByKey(next));
		}
		return copy;
	},
	getKeysAsReadOnlyListOfString : function() {
		return this.m_storage.getKeysAsReadOnlyListOfString();
	},
	getKeysAsIteratorOfString : function() {
		return this.m_storage.getKeysAsIteratorOfString();
	},
	putIfNotNull : function(key, element) {
		if (element !== null) {
			this.put(key, element);
		}
	},
	put : function(key, element) {
		if (key === null) {
			throw sap.firefly.XException
					.createIllegalArgumentException("Null cannot be key");
		}
		this.m_storage.put(key, sap.firefly.XWeakReferenceUtil
				.getWeakRef(element));
	},
	getValuesAsReadOnlyList : function() {
		var list = sap.firefly.XList.create();
		var iterator = this.getKeysAsIteratorOfString();
		var next;
		var weakRef;
		var hardRef;
		while (iterator.hasNext()) {
			next = iterator.next();
			weakRef = this.m_storage.getByKey(next);
			hardRef = sap.firefly.XWeakReferenceUtil.getHardRef(weakRef);
			list.add(hardRef);
		}
		return list;
	},
	getIterator : function() {
		return this.getValuesAsReadOnlyList().getIterator();
	},
	isEqualTo : function(other) {
		var otherMap;
		var keys;
		var key;
		var thisValue;
		var thatValue;
		if (other === null) {
			return false;
		}
		if (this === other) {
			return true;
		}
		otherMap = other;
		if (this.size() !== otherMap.size()) {
			return false;
		}
		keys = this.getKeysAsIteratorOfString();
		while (keys.hasNext()) {
			key = keys.next();
			if (otherMap.containsKey(key) === false) {
				return false;
			}
			thisValue = this.getByKey(key);
			thatValue = otherMap.getByKey(key);
			if (thisValue === null) {
				if (thatValue !== null) {
					return false;
				}
			} else {
				if (thisValue.isEqualTo(thatValue) === false) {
					return false;
				}
			}
		}
		keys.releaseObject();
		return true;
	},
	toString : function() {
		return this.m_storage.toString();
	}
});
$Firefly.createClass("sap.firefly.PrBoolean", sap.firefly.PrElement, {
	$statics : {
		create : function() {
			return new sap.firefly.PrBoolean();
		},
		createWithValue : function(value) {
			var proxy = new sap.firefly.PrBoolean();
			proxy.m_value = value;
			return proxy;
		}
	},
	m_value : false,
	getPermaCopy : function() {
		return sap.firefly.PrBoolean.createWithValue(this.m_value);
	},
	getBooleanValue : function() {
		return this.m_value;
	},
	setBooleanValue : function(booleanValue) {
		this.m_value = booleanValue;
	},
	getType : function() {
		return sap.firefly.PrElementType.BOOLEAN;
	},
	asBoolean : function() {
		return this;
	},
	asString : function() {
		return sap.firefly.PrString.createWithValue(sap.firefly.XBoolean
				.convertBooleanToString(this.m_value));
	}
});
$Firefly
		.createClass(
				"sap.firefly.PrList",
				sap.firefly.PrElement,
				{
					$statics : {
						create : function() {
							var list = new sap.firefly.PrList();
							list.m_list = sap.firefly.XList.create();
							return list;
						},
						copyInternal : function(origin, target) {
							var len = origin.size();
							var childCopy;
							var prNull = sap.firefly.PrElementType.THE_NULL;
							var prStruct = sap.firefly.PrElementType.STRUCTURE;
							var prList = sap.firefly.PrElementType.LIST;
							var i;
							var current;
							var type;
							for (i = 0; i < len; i++) {
								current = origin.getElementByIndex(i);
								if (current === null) {
									target.addNull();
								} else {
									type = current.getType();
									if (type === prNull) {
										target.addNull();
									} else {
										if (type === prStruct) {
											childCopy = sap.firefly.PrStructure
													.createDeepCopy((current));
											target.add(childCopy);
										} else {
											if (type === prList) {
												childCopy = sap.firefly.PrList
														.createDeepCopy((current));
												target.add(childCopy);
											} else {
												target.add(current
														.getPermaCopy());
											}
										}
									}
								}
							}
						},
						createDeepCopy : function(origin) {
							var list = sap.firefly.PrList.create();
							sap.firefly.PrList.copyInternal(origin, list);
							return list;
						}
					},
					m_list : null,
					releaseObject : function() {
						this.m_list = sap.firefly.XObject
								.releaseIfNotNull(this.m_list);
						sap.firefly.PrList.$superclass.releaseObject.call(this);
					},
					clone : function() {
						return sap.firefly.PrList.createDeepCopy(this);
					},
					getType : function() {
						return sap.firefly.PrElementType.LIST;
					},
					getStructureByIndex : function(index) {
						var element = this.m_list.get(index);
						if ((element === null)
								|| (element.isStructure() === false)) {
							return null;
						}
						return element;
					},
					getListByIndex : function(index) {
						var element = this.m_list.get(index);
						if ((element === null) || (element.isList() === false)) {
							return null;
						}
						return element;
					},
					getElementByIndex : function(index) {
						var element = this.m_list.get(index);
						if ((element !== null)
								&& (element.getType() === sap.firefly.PrElementType.THE_NULL)) {
							return null;
						}
						return element;
					},
					getStringByIndex : function(index) {
						var element = this.m_list.get(index);
						if ((element === null)
								|| (element.isString() === false)) {
							return null;
						}
						return (element).getStringValue();
					},
					getIntegerByIndex : function(index) {
						var element = this.m_list.get(index);
						if ((element === null)
								|| (element.isNumeric() === false)) {
							return 0;
						}
						return (element).getIntegerValue();
					},
					getDoubleByIndex : function(index) {
						var element = this.m_list.get(index);
						if ((element === null)
								|| (element.isNumeric() === false)) {
							return 0;
						}
						return (element).getDoubleValue();
					},
					getLongByIndex : function(index) {
						var element = this.m_list.get(index);
						if ((element === null)
								|| (element.isNumeric() === false)) {
							return 0;
						}
						return (element).getLongValue();
					},
					getElementTypeByIndex : function(index) {
						return this.m_list.get(index).getType();
					},
					addAll : function(listToAdd) {
						var i;
						if (listToAdd !== null) {
							for (i = 0; i < listToAdd.size(); i++) {
								this.add(listToAdd.getElementByIndex(i));
							}
						}
						return this;
					},
					addBoolean : function(value) {
						this.m_list.add(sap.firefly.PrBoolean
								.createWithValue(value));
						return this;
					},
					addNull : function() {
						this.m_list.add(sap.firefly.PrNull.create());
						return this;
					},
					addString : function(value) {
						this.m_list.add(sap.firefly.PrString
								.createWithValue(value));
						return this;
					},
					addInteger : function(value) {
						this.m_list.add(sap.firefly.PrInteger
								.createWithValue(value));
						return this;
					},
					setIntegerAt : function(value, index) {
						this.m_list.set(index, sap.firefly.PrInteger
								.createWithValue(value));
						return this;
					},
					addLong : function(value) {
						this.m_list.add(sap.firefly.PrLong
								.createWithValue(value));
						return this;
					},
					setLongAt : function(value, index) {
						this.m_list.set(index, sap.firefly.PrLong
								.createWithValue(value));
						return this;
					},
					setElementAt : function(value, index) {
						this.m_list.set(index, value);
						return this;
					},
					addDouble : function(value) {
						this.m_list.add(sap.firefly.PrDouble
								.createWithValue(value));
						return this;
					},
					getBooleanByIndex : function(index) {
						return (this.m_list.get(index)).getBooleanValue();
					},
					getNullByIndex : function(index) {
						return sap.firefly.ConstantValue.THE_NULL;
					},
					add : function(element) {
						this.m_list.add(element);
						return this;
					},
					asList : function() {
						return this;
					},
					size : function() {
						return this.m_list.size();
					},
					isEmpty : function() {
						return this.m_list.isEmpty();
					},
					addNewStructure : function() {
						var structure = sap.firefly.PrStructure.create();
						this.add(structure);
						return structure;
					},
					addNewList : function() {
						var list = sap.firefly.PrList.create();
						this.add(list);
						return list;
					},
					getStringByIndexWithDefault : function(index, defaultValue) {
						if ((this.size() > index)
								&& (index >= 0)
								&& (this.getElementTypeByIndex(index) === sap.firefly.PrElementType.STRING)) {
							return this.getStringByIndex(index);
						}
						return defaultValue;
					},
					getIntegerByIndexWithDefault : function(index, defaultValue) {
						if ((this.size() > index)
								&& (index >= 0)
								&& (this.getElementTypeByIndex(index)
										.isNumber())) {
							return this.getIntegerByIndex(index);
						}
						return defaultValue;
					},
					getLongByIndexWithDefault : function(index, defaultValue) {
						if ((this.size() > index)
								&& (index >= 0)
								&& (this.getElementTypeByIndex(index)
										.isNumber())) {
							return this.getLongByIndex(index);
						}
						return defaultValue;
					},
					getDoubleByIndexWithDefault : function(index, defaultValue) {
						if ((this.size() > index)
								&& (index >= 0)
								&& (this.getElementTypeByIndex(index)
										.isNumber())) {
							return this.getDoubleByIndex(index);
						}
						return defaultValue;
					},
					getBooleanByIndexWithDefault : function(index, defaultValue) {
						if ((this.size() > index)
								&& (index >= 0)
								&& (this.getElementTypeByIndex(index) === sap.firefly.PrElementType.BOOLEAN)) {
							return this.getBooleanByIndex(index);
						}
						return defaultValue;
					},
					clear : function() {
						this.m_list.clear();
					},
					copyFrom : function(origin) {
						this.clear();
						sap.firefly.PrList.copyInternal(origin, this);
					}
				});
$Firefly.createClass("sap.firefly.PrNull", sap.firefly.PrElement, {
	$statics : {
		create : function() {
			return new sap.firefly.PrNull();
		}
	},
	getType : function() {
		return sap.firefly.PrElementType.THE_NULL;
	},
	getNullValue : function() {
		return sap.firefly.ConstantValue.THE_NULL;
	},
	asNull : function() {
		return this;
	}
});
$Firefly.createClass("sap.firefly.PrObject", sap.firefly.PrElement, {
	$statics : {
		create : function() {
			return new sap.firefly.PrObject();
		}
	},
	m_value : null,
	releaseObject : function() {
		this.m_value = null;
		sap.firefly.PrObject.$superclass.releaseObject.call(this);
	},
	getObjectValue : function() {
		return this.m_value;
	},
	setObjectValue : function(value) {
		this.m_value = value;
	},
	getType : function() {
		return sap.firefly.PrElementType.OBJECT;
	},
	asObject : function() {
		return this;
	}
});
$Firefly.createClass("sap.firefly.PrString", sap.firefly.PrElement, {
	$statics : {
		create : function() {
			return new sap.firefly.PrString();
		},
		createWithValue : function(value) {
			var newObj = new sap.firefly.PrString();
			newObj.m_value = value;
			return newObj;
		}
	},
	m_value : null,
	getPermaCopy : function() {
		return sap.firefly.PrString.createWithValue(this.m_value);
	},
	releaseObject : function() {
		this.m_value = null;
		sap.firefly.PrString.$superclass.releaseObject.call(this);
	},
	getType : function() {
		return sap.firefly.PrElementType.STRING;
	},
	getStringValue : function() {
		return this.m_value;
	},
	setStringValue : function(stringValue) {
		this.m_value = stringValue;
	},
	asString : function() {
		return this;
	},
	toString : function() {
		return this.m_value;
	}
});
$Firefly
		.createClass(
				"sap.firefly.PrStructure",
				sap.firefly.PrElement,
				{
					$statics : {
						create : function() {
							var structure = new sap.firefly.PrStructure();
							structure.m_elementValueMap = sap.firefly.XLinkedHashMapByString
									.create();
							return structure;
						},
						createDeepCopy : function(origin) {
							var structure;
							var childCopy;
							var prNull;
							var prStruct;
							var prList;
							var elementNames;
							var len;
							var i;
							var name;
							var type;
							var list;
							if (origin === null) {
								return null;
							}
							structure = sap.firefly.PrStructure.create();
							prNull = sap.firefly.PrElementType.THE_NULL;
							prStruct = sap.firefly.PrElementType.STRUCTURE;
							prList = sap.firefly.PrElementType.LIST;
							elementNames = origin.getStructureElementNames();
							len = elementNames.size();
							for (i = 0; i < len; i++) {
								name = elementNames.get(i);
								type = origin.getElementTypeByName(name);
								if (type === prNull) {
									structure.setNullByName(name);
								} else {
									if (type === prStruct) {
										childCopy = sap.firefly.PrStructure
												.createDeepCopy(origin
														.getStructureByName(name));
										structure.setElementByName(name,
												childCopy);
									} else {
										if (type === prList) {
											list = origin.getListByName(name);
											childCopy = sap.firefly.PrList
													.createDeepCopy(list);
											structure.setElementByName(name,
													childCopy);
										} else {
											structure.setElementByName(name,
													origin.getElementByName(
															name)
															.getPermaCopy());
										}
									}
								}
							}
							return structure;
						}
					},
					m_elementValueMap : null,
					releaseObject : function() {
						this.m_elementValueMap = sap.firefly.XObject
								.releaseIfNotNull(this.m_elementValueMap);
						sap.firefly.PrStructure.$superclass.releaseObject
								.call(this);
					},
					clone : function() {
						return sap.firefly.PrStructure.createDeepCopy(this);
					},
					asStructure : function() {
						return this;
					},
					getStringByName : function(name) {
						var byKey = this.m_elementValueMap.getByKey(name);
						var stringObj;
						if (byKey === null) {
							return null;
						}
						stringObj = byKey.asString();
						if (stringObj === null) {
							return null;
						}
						return stringObj.getStringValue();
					},
					setStringByName : function(name, value) {
						this.m_elementValueMap.put(name, sap.firefly.PrString
								.createWithValue(value));
					},
					getIntegerByName : function(name) {
						return this.m_elementValueMap.getByKey(name).asNumber()
								.getIntegerValue();
					},
					setIntegerByName : function(name, value) {
						if (sap.firefly.XMath.isNaN(value)) {
							this.setNullByName(name);
						} else {
							this.m_elementValueMap.put(name,
									sap.firefly.PrInteger
											.createWithValue(value));
						}
					},
					getLongByName : function(name) {
						return this.m_elementValueMap.getByKey(name).asNumber()
								.getLongValue();
					},
					setLongByName : function(name, value) {
						if (sap.firefly.XMath.isNaN(value)) {
							this.setNullByName(name);
						} else {
							this.m_elementValueMap.put(name, sap.firefly.PrLong
									.createWithValue(value));
						}
					},
					getDoubleByName : function(name) {
						return this.m_elementValueMap.getByKey(name).asNumber()
								.getDoubleValue();
					},
					setDoubleByName : function(name, value) {
						if (sap.firefly.XMath.isNaN(value)) {
							this.setNullByName(name);
						} else {
							this.m_elementValueMap
									.put(name, sap.firefly.PrDouble
											.createWithValue(value));
						}
					},
					getBooleanByName : function(name) {
						return (this.m_elementValueMap.getByKey(name))
								.getBooleanValue();
					},
					setBooleanByName : function(name, value) {
						this.m_elementValueMap.put(name, sap.firefly.PrBoolean
								.createWithValue(value));
					},
					getNullByName : function(name) {
						var element = this.m_elementValueMap.getByKey(name);
						var iOcpElement;
						if (element === null) {
							return sap.firefly.ConstantValue.THE_NULL;
						}
						iOcpElement = element.asNull();
						if (iOcpElement === null) {
							return sap.firefly.ConstantValue.THE_NULL;
						}
						return iOcpElement.getNullValue();
					},
					setNullByName : function(name) {
						this.m_elementValueMap.put(name, sap.firefly.PrNull
								.create());
					},
					getType : function() {
						return sap.firefly.PrElementType.STRUCTURE;
					},
					getStructureByName : function(name) {
						return this.m_elementValueMap.getByKey(name);
					},
					getListByName : function(name) {
						return this.m_elementValueMap.getByKey(name);
					},
					getStructureElementNames : function() {
						return this.m_elementValueMap
								.getKeysAsReadOnlyListOfString();
					},
					getElementByName : function(name) {
						return this.m_elementValueMap.getByKey(name);
					},
					setElementByName : function(name, element) {
						if (element === null) {
							this.m_elementValueMap.remove(name);
						} else {
							this.m_elementValueMap.put(name, element);
						}
					},
					getElementTypeByName : function(name) {
						return this.m_elementValueMap.getByKey(name).getType();
					},
					hasValueByName : function(name) {
						return this.m_elementValueMap.containsKey(name);
					},
					getObjectByName : function(name) {
						return this.m_elementValueMap.getByKey(name).asObject()
								.getObjectValue();
					},
					setObjectByName : function(name, value) {
						var ocpObj = sap.firefly.PrObject.create();
						ocpObj.setObjectValue(value);
						this.m_elementValueMap.put(name, ocpObj);
					},
					hasElements : function() {
						return this.m_elementValueMap.isEmpty() === false;
					},
					getBooleanByNameWithDefault : function(name, defaultValue) {
						if (this.hasValueByName(name)) {
							return this.getBooleanByName(name);
						}
						return defaultValue;
					},
					getStringByNameWithDefault : function(name, defaultValue) {
						if (this.hasValueByName(name)) {
							return this.getStringByName(name);
						}
						return defaultValue;
					},
					getIntegerByNameWithDefault : function(name, defaultValue) {
						if (this.hasValueByName(name)) {
							return this.getIntegerByName(name);
						}
						return defaultValue;
					},
					getLongByNameWithDefault : function(name, defaultValue) {
						if (this.hasValueByName(name)) {
							return this.getLongByName(name);
						}
						return defaultValue;
					},
					getDoubleByNameWithDefault : function(name, defaultValue) {
						if (this.hasValueByName(name)) {
							return this.getDoubleByName(name);
						}
						return defaultValue;
					},
					setStringByNameNotNull : function(name, value) {
						if (value !== null) {
							this.setStringByName(name, value);
						}
					},
					getObjectByNameWithDefault : function(name, defaultValue) {
						if (this.hasValueByName(name)) {
							return this.getObjectByName(name);
						}
						return defaultValue;
					},
					setNewListByName : function(name) {
						var list = sap.firefly.PrList.create();
						this.setElementByName(name, list);
						return list;
					},
					setNewStructureByName : function(name) {
						var structure = sap.firefly.PrStructure.create();
						this.setElementByName(name, structure);
						return structure;
					},
					getStructureElementNamesSorted : function() {
						var structureElementNames = this
								.getStructureElementNames();
						var sorted;
						if ((structureElementNames === null)
								|| (structureElementNames.isEmpty())) {
							return structureElementNames;
						}
						sorted = sap.firefly.XListOfString
								.createFromReadOnlyList(structureElementNames);
						sorted
								.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
						return sorted;
					},
					hasStringByName : function(name) {
						if (this.hasValueByName(name) === false) {
							return false;
						}
						return this.getElementTypeByName(name) === sap.firefly.PrElementType.STRING;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XPointValue",
				sap.firefly.AbstractGeometry,
				{
					$statics : {
						WKT_START : "POINT",
						createWithPosition : function(posX, posY) {
							var point = sap.firefly.XPointValue.create();
							point.setXPosition(posX);
							point.setYPosition(posY);
							return point;
						},
						createWithPositionAndSrid : function(posX, posY, srid) {
							var point = sap.firefly.XPointValue.create();
							point.setXPosition(posX);
							point.setYPosition(posY);
							point.setSrid(sap.firefly.XIntegerValue
									.create(srid));
							return point;
						},
						createWithWkt : function(wkt) {
							var point;
							var openingParenthesis;
							var closingParenthesis;
							var stringCoordinates;
							var spaceIndex;
							var strX;
							var strY;
							var xPos;
							var yPos;
							if ((sap.firefly.XString.indexOf(wkt,
									sap.firefly.XPointValue.WKT_START) === -1)
									|| sap.firefly.XString.startsWith(wkt,
											"MULTIPOINT")) {
								return null;
							}
							point = sap.firefly.XPointValue.create();
							openingParenthesis = sap.firefly.XString.indexOf(
									wkt, "(");
							closingParenthesis = sap.firefly.XString.indexOf(
									wkt, ")");
							stringCoordinates = sap.firefly.XString
									.trim(sap.firefly.XString.substring(wkt,
											openingParenthesis + 1,
											closingParenthesis));
							spaceIndex = sap.firefly.XString.indexOf(
									stringCoordinates, " ");
							strX = sap.firefly.XString.substring(
									stringCoordinates, 0, spaceIndex);
							strY = sap.firefly.XString
									.substring(stringCoordinates,
											spaceIndex + 1, sap.firefly.XString
													.size(stringCoordinates));
							xPos = sap.firefly.XDouble
									.convertStringToDouble(strX);
							yPos = sap.firefly.XDouble
									.convertStringToDouble(strY);
							point.setXPosition(xPos);
							point.setYPosition(yPos);
							return point;
						},
						create : function() {
							return new sap.firefly.XPointValue();
						}
					},
					m_xPosition : 0,
					m_yPosition : 0,
					getXPosition : function() {
						return this.m_xPosition;
					},
					getYPosition : function() {
						return this.m_yPosition;
					},
					setXPosition : function(posX) {
						this.m_xPosition = posX;
					},
					setYPosition : function(posY) {
						this.m_yPosition = posY;
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.POINT;
					},
					resetValue : function(value) {
						var otherValue;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if (this.getValueType() !== value.getValueType()) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						otherValue = value;
						this.m_xPosition = otherValue.m_xPosition;
						this.m_yPosition = otherValue.m_yPosition;
					},
					isEqualTo : function(other) {
						var xOther;
						if (sap.firefly.XPointValue.$superclass.isEqualTo.call(
								this, other) === false) {
							return false;
						}
						xOther = other;
						return (this.getXPosition() === xOther.getXPosition())
								&& (this.getYPosition() === xOther
										.getYPosition());
					},
					clone : function() {
						var clone = sap.firefly.XPointValue.createWithPosition(
								this.m_xPosition, this.m_yPosition);
						clone.setSrid(this.getSrid());
						return clone;
					},
					toWKT : function() {
						var sb = sap.firefly.XStringBuffer.create();
						sb.append(sap.firefly.XPointValue.WKT_START);
						sb.append(" (");
						sb.append(this.toString());
						sb.append(")");
						return sb.toString();
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						sb.appendDouble(this.m_xPosition);
						sb.append(" ");
						sb.appendDouble(this.m_yPosition);
						return sb.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XPolygonValue",
				sap.firefly.AbstractGeometry,
				{
					$statics : {
						WKT_START : "POLYGON",
						WKT_END : "))",
						WKT_CIRCUIT_END : ")",
						WKT_CIRCUIT_START : "(",
						WKT_COORD_SEPERATOR : ", ",
						WKT_COORD_SEPERATOR_WO_SPACE : ",",
						create : function() {
							var polygon = new sap.firefly.XPolygonValue();
							polygon.setup();
							return polygon;
						},
						createWithWkt : function(wkt) {
							var polygon;
							var openingParenthesis;
							var closingParenthesis;
							var stringCoordinates;
							var stringCircuits;
							var circuitIterator;
							var isHull;
							var stringCircuit;
							var hole;
							var indexOf;
							var listCoordinates;
							var pointIterator;
							var pointString;
							var pointCoordinates;
							var point;
							if (sap.firefly.XString.startsWith(wkt,
									sap.firefly.XPolygonValue.WKT_START) === false) {
								return null;
							}
							polygon = sap.firefly.XPolygonValue.create();
							openingParenthesis = sap.firefly.XString.indexOf(
									wkt, "((");
							closingParenthesis = sap.firefly.XString.indexOf(
									wkt, sap.firefly.XPolygonValue.WKT_END);
							stringCoordinates = sap.firefly.XString.substring(
									wkt, openingParenthesis + 2,
									closingParenthesis);
							stringCircuits = sap.firefly.XStringTokenizer
									.splitString(
											stringCoordinates,
											sap.firefly.XPolygonValue.WKT_CIRCUIT_END);
							circuitIterator = stringCircuits.getIterator();
							isHull = true;
							while (circuitIterator.hasNext()) {
								stringCircuit = circuitIterator.next();
								hole = null;
								if (isHull === false) {
									hole = sap.firefly.XList.create();
								}
								indexOf = sap.firefly.XString
										.indexOf(
												stringCircuit,
												sap.firefly.XPolygonValue.WKT_CIRCUIT_START);
								if (indexOf > 0) {
									stringCircuit = sap.firefly.XString
											.substring(
													stringCircuit,
													indexOf + 1,
													sap.firefly.XString
															.size(stringCircuit));
								}
								if (sap.firefly.XString
										.indexOf(
												stringCircuit,
												sap.firefly.XPolygonValue.WKT_COORD_SEPERATOR) !== -1) {
									listCoordinates = sap.firefly.XStringTokenizer
											.splitString(
													stringCircuit,
													sap.firefly.XPolygonValue.WKT_COORD_SEPERATOR);
								} else {
									listCoordinates = sap.firefly.XStringTokenizer
											.splitString(
													stringCircuit,
													sap.firefly.XPolygonValue.WKT_COORD_SEPERATOR_WO_SPACE);
								}
								pointIterator = listCoordinates.getIterator();
								while (pointIterator.hasNext()) {
									pointString = pointIterator.next();
									pointCoordinates = sap.firefly.XStringTokenizer
											.splitString(sap.firefly.XString
													.trim(pointString), " ");
									point = sap.firefly.XPointValue.create();
									point
											.setXPosition(sap.firefly.XDouble
													.convertStringToDouble(pointCoordinates
															.get(0)));
									point
											.setYPosition(sap.firefly.XDouble
													.convertStringToDouble(pointCoordinates
															.get(1)));
									if (isHull) {
										polygon.getHull().add(point);
									} else {
										hole.add(point);
									}
								}
								if (isHull === false) {
									polygon.getHoles().add(hole);
								}
								isHull = false;
							}
							polygon.finalizePolygon();
							return polygon;
						},
						finalizeCircuit : function(circuit) {
							var len = circuit.size();
							var first;
							var last;
							if (len > 0) {
								first = circuit.get(0);
								last = circuit.get(len - 1);
								if (first.isEqualTo(last) === false) {
									circuit.add(sap.firefly.XPointValue
											.createWithPosition(first
													.getXPosition(), first
													.getYPosition()));
								}
							}
						},
						areCircuitsEqual : function(circuit1, circuit2) {
							var pointIdx;
							if (circuit1.size() !== circuit2.size()) {
								return false;
							}
							for (pointIdx = 0; pointIdx < circuit1.size(); pointIdx++) {
								if (circuit1.get(pointIdx).isEqualTo(
										circuit2.get(pointIdx)) === false) {
									return false;
								}
							}
							return true;
						},
						circuitToString : function(circuit) {
							var sb = sap.firefly.XStringBuffer.create();
							var i;
							sb
									.append(sap.firefly.XPolygonValue.WKT_CIRCUIT_START);
							for (i = 0; i < circuit.size(); i++) {
								if (i > 0) {
									sb.append(", ");
								}
								sb.append(circuit.get(i).toString());
							}
							sb
									.append(sap.firefly.XPolygonValue.WKT_CIRCUIT_END);
							return sb.toString();
						}
					},
					m_hull : null,
					m_holes : null,
					m_isFinalized : false,
					releaseObject : function() {
						this.m_holes = sap.firefly.XObject
								.releaseIfNotNull(this.m_holes);
						this.m_hull = sap.firefly.XObject
								.releaseIfNotNull(this.m_hull);
						sap.firefly.XPolygonValue.$superclass.releaseObject
								.call(this);
					},
					setup : function() {
						this.m_hull = sap.firefly.XList.create();
						this.m_holes = sap.firefly.XList.create();
						this.m_isFinalized = false;
					},
					getPoints : function() {
						return this.m_hull;
					},
					getHull : function() {
						if (this.isFinalized()) {
							return null;
						}
						return this.m_hull;
					},
					finalizePolygon : function() {
						var holeIterator;
						if (this.isFinalized() === false) {
							sap.firefly.XPolygonValue
									.finalizeCircuit(this.m_hull);
							holeIterator = this.m_holes.getIterator();
							while (holeIterator.hasNext()) {
								sap.firefly.XPolygonValue
										.finalizeCircuit(holeIterator.next());
							}
							holeIterator.releaseObject();
							this.m_isFinalized = true;
						}
					},
					resetValue : function(value) {
						var valuePolygon;
						var valueCoordinates;
						var pointIdx;
						var holeIdx;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if ((value.getValueType() !== sap.firefly.XValueType.POLYGON)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Parameter is no polygon");
						}
						if (this.isFinalized()) {
							throw sap.firefly.XException
									.createIllegalStateException("Can't reset finalized polygon");
						}
						valuePolygon = value;
						this.m_hull.clear();
						valueCoordinates = valuePolygon.getPoints();
						for (pointIdx = 0; pointIdx < valueCoordinates.size(); pointIdx++) {
							this.m_hull.add(valueCoordinates.get(pointIdx));
						}
						this.m_holes.clear();
						for (holeIdx = 0; holeIdx < valuePolygon.getHoles()
								.size(); holeIdx++) {
							this.m_holes.add(valuePolygon.getHoles().get(
									holeIdx));
						}
					},
					isEqualTo : function(other) {
						var xOther;
						var holeIdx;
						var currentHole;
						var otherHole;
						if (sap.firefly.XPolygonValue.$superclass.isEqualTo
								.call(this, other) === false) {
							return false;
						}
						xOther = other;
						if (this.isFinalized() !== xOther.isFinalized()) {
							return false;
						}
						if (sap.firefly.XPolygonValue.areCircuitsEqual(this
								.getPoints(), xOther.getPoints()) === false) {
							return false;
						}
						for (holeIdx = 0; holeIdx < this.getHoles().size(); holeIdx++) {
							currentHole = this.getHoles().get(holeIdx);
							otherHole = xOther.getHoles().get(holeIdx);
							if (sap.firefly.XPolygonValue.areCircuitsEqual(
									currentHole, otherHole) === false) {
								return false;
							}
						}
						return true;
					},
					clone : function() {
						var clone = sap.firefly.XPolygonValue.create();
						var pointIdx;
						var holeIdx;
						for (pointIdx = 0; pointIdx < this.m_hull.size(); pointIdx++) {
							clone.getHull().add(this.m_hull.get(pointIdx));
						}
						for (holeIdx = 0; holeIdx < this.m_holes.size(); holeIdx++) {
							clone.getHoles().add(this.m_holes.get(holeIdx));
						}
						if (this.isFinalized()) {
							clone.finalizePolygon();
						}
						clone.setSrid(this.getSrid());
						return clone;
					},
					toWKT : function() {
						var wktBuffer = sap.firefly.XStringBuffer.create();
						wktBuffer.append(sap.firefly.XPolygonValue.WKT_START);
						wktBuffer.append(" ");
						wktBuffer.append(this.toString());
						return wktBuffer.toString();
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.POLYGON;
					},
					isFinalized : function() {
						return this.m_isFinalized;
					},
					getHoles : function() {
						return this.m_holes;
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						var circuitIterator;
						sb.append(sap.firefly.XPolygonValue.WKT_CIRCUIT_START);
						sb.append(sap.firefly.XPolygonValue
								.circuitToString(this.m_hull));
						circuitIterator = this.m_holes.getIterator();
						while (circuitIterator.hasNext()) {
							sb.append(", ");
							sb.append(sap.firefly.XPolygonValue
									.circuitToString(circuitIterator.next()));
						}
						sb.append(sap.firefly.XPolygonValue.WKT_CIRCUIT_END);
						return sb.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SyncAction",
				sap.firefly.MessageManager,
				{
					m_syncState : null,
					m_syncType : null,
					m_isSyncCanceled : false,
					m_actionContext : null,
					m_dataHardRef : null,
					m_dataWeakRef : null,
					m_convertDataToWeak : false,
					m_listeners : null,
					m_isInsideListenerCall : false,
					m_syncChild : null,
					m_checkWeakConversion : false,
					m_queue : null,
					setupActionAndRun : function(syncType, context, listener,
							customIdentifier) {
						this.setupSynchronizingObject(context);
						this.processSyncAction(syncType, listener,
								customIdentifier);
					},
					setupSynchronizingObject : function(context) {
						this.setup();
						this.m_syncState = sap.firefly.SyncState.OUT_OF_SYNC;
						this.m_syncType = null;
						this.m_listeners = sap.firefly.XList.create();
						this.m_convertDataToWeak = false;
						this.setActionContext(context);
					},
					releaseObject : function() {
						if (this.m_isInsideListenerCall === false) {
							this.m_actionContext = null;
							this.m_dataHardRef = null;
							this.m_dataWeakRef = null;
							this.m_listeners = sap.firefly.XObject
									.releaseIfNotNull(this.m_listeners);
							this.m_queue = sap.firefly.XObject
									.releaseIfNotNull(this.m_queue);
							this.m_syncChild = null;
							this.m_syncState = null;
							this.m_syncType = null;
							sap.firefly.SyncAction.$superclass.releaseObject
									.call(this);
						}
					},
					processSyncAction : function(syncType, listener,
							customIdentifier) {
						var activeSyncType;
						var continueProcessing;
						this.attachListener(listener,
								sap.firefly.ListenerType.SPECIFIC,
								customIdentifier);
						if (this.m_syncState === sap.firefly.SyncState.OUT_OF_SYNC) {
							activeSyncType = this
									.startSyncAndClearErrors(syncType);
							if (activeSyncType !== sap.firefly.SyncType.DELAYED) {
								continueProcessing = this
										.processSynchronization(activeSyncType);
								if (continueProcessing === false) {
									this.endSync();
								}
							}
						}
						return this;
					},
					processSyncGeneric : function(syncType, listener,
							customIdentifier) {
						var activeSyncType;
						var continueProcessing;
						if (this.m_syncState === sap.firefly.SyncState.OUT_OF_SYNC) {
							this.attachListener(listener,
									sap.firefly.ListenerType.SYNC_LISTENER,
									customIdentifier);
							activeSyncType = this
									.startSyncAndClearErrors(syncType);
							if (activeSyncType !== sap.firefly.SyncType.DELAYED) {
								continueProcessing = this
										.processSynchronization(activeSyncType);
								if (continueProcessing === false) {
									this.endSync();
								}
							}
						}
					},
					processSynchronization : function(syncType) {
						return false;
					},
					startSyncAndClearErrors : function(syncType) {
						var activeSyncType;
						this.addProfileStep("processSynchronization");
						this.m_isSyncCanceled = false;
						this.clearMessages();
						activeSyncType = this.setActiveSyncType(syncType);
						if (syncType !== sap.firefly.SyncType.DELAYED) {
							this.setSyncState(sap.firefly.SyncState.PROCESSING);
						}
						return activeSyncType;
					},
					getActiveSyncType : function() {
						return this.m_syncType;
					},
					setActiveSyncType : function(syncType) {
						var session;
						if ((syncType === sap.firefly.SyncType.REGISTER)
								|| (syncType === sap.firefly.SyncType.UNREGISTER)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Register/Unregister not supported here");
						} else {
							if ((this.m_syncType === null)
									|| (this.m_syncType === sap.firefly.SyncType.DELAYED)) {
								if (syncType !== null) {
									this.m_syncType = syncType;
								} else {
									session = this.getSession();
									if (session !== null) {
										this.m_syncType = session
												.getDefaultSyncType();
									} else {
										this.m_syncType = sap.firefly.SyncType.BLOCKING;
									}
								}
							}
						}
						return this.m_syncType;
					},
					cancelSynchronization : function() {
						var cancellingChild;
						this.endProfileStep();
						this.m_isSyncCanceled = true;
						cancellingChild = this.getChildSynchronizer();
						if (cancellingChild !== null) {
							cancellingChild.cancelSynchronization();
						}
						this.releaseObject();
						this.setSyncState(sap.firefly.SyncState.IN_SYNC);
					},
					isSyncCanceled : function() {
						return this.m_isSyncCanceled;
					},
					processQueue : function() {
						var i;
						var currentSyncAction;
						while (this.m_queue.size() > 0) {
							for (i = 0; i < this.m_queue.size();) {
								currentSyncAction = this.m_queue.get(i);
								if (currentSyncAction.callListeners(false) === false) {
									this.m_queue.removeAt(i);
								} else {
									i++;
								}
							}
						}
					},
					onInSync : function() {
						var session;
						var listenerProcessor;
						if (this.m_isInsideListenerCall === false) {
							this.m_isInsideListenerCall = true;
							if ((this.m_listeners !== null)
									&& (this.m_listeners.size() > 0)) {
								this.m_checkWeakConversion = true;
								if (this.getActiveSyncType() === sap.firefly.SyncType.NON_BLOCKING) {
									session = this.getSession();
									if (session !== null) {
										listenerProcessor = session
												.getListenerProcessor();
										if (listenerProcessor !== null) {
											listenerProcessor.addToQueue(this);
										} else {
											session.setListenerProcessor(this);
											this.m_queue = sap.firefly.XList
													.create();
											this.m_queue.add(this);
											if (sap.firefly.XVersion.API_ACTIVE >= sap.firefly.XVersion.API_V3_SYNC_ACTION) {
												this.processQueue();
											} else {
												try {
													this.processQueue();
												} catch (e) {
													this
															.addError(
																	sap.firefly.ErrorCodes.OTHER_ERROR,
																	sap.firefly.XException
																			.getStackTrace(
																					e,
																					0));
												}
											}
											this.m_queue = null;
											session.setListenerProcessor(null);
										}
									} else {
										this.callListeners(true);
									}
								} else {
									this.callListeners(true);
								}
							}
							this.m_isInsideListenerCall = false;
						}
					},
					addToQueue : function(syncAction) {
						if (this.m_queue.contains(syncAction) === false) {
							this.m_queue.add(syncAction);
						}
					},
					getSyncState : function() {
						return this.m_syncState;
					},
					endSync : function() {
						if (this.m_syncState !== sap.firefly.SyncState.IN_SYNC) {
							this.endProfileStep();
							this.m_syncState = sap.firefly.SyncState.IN_SYNC;
							this.onInSync();
						}
						this.setActiveSyncType(null);
					},
					setSyncState : function(syncState) {
						if (this.m_syncState !== syncState) {
							this.endProfileStep();
							this.m_syncState = syncState;
							if (syncState === sap.firefly.SyncState.IN_SYNC) {
								this.onInSync();
							}
						}
					},
					resetSyncState : function() {
						if (this.m_syncState === sap.firefly.SyncState.IN_SYNC) {
							this.m_syncState = sap.firefly.SyncState.OUT_OF_SYNC;
							this.m_isSyncCanceled = false;
							this.m_syncType = null;
							this.clearMessages();
							if (this.m_listeners !== null) {
								this.m_listeners.clear();
							}
							this.m_syncChild = null;
							this.m_dataHardRef = null;
							this.m_dataWeakRef = null;
							return true;
						} else {
							if (this.m_syncState === sap.firefly.SyncState.PROCESSING) {
								throw sap.firefly.XException
										.createIllegalStateException("Action is still in processing, it cannot be reset.");
							} else {
								return false;
							}
						}
					},
					attachAllListeners : function(listenerPairs) {
						var i;
						var pair;
						for (i = 0; i < listenerPairs.size(); i++) {
							pair = listenerPairs.get(i);
							this.attachListener(pair.getFirstObject(),
									sap.firefly.ListenerType.SPECIFIC, pair
											.getSecondObject());
						}
					},
					attachListener : function(listener, type, customIdentifier) {
						var pair;
						if (listener !== null) {
							pair = sap.firefly.SyncActionListenerPair.create(
									listener, type, customIdentifier);
							if (this.m_listeners !== null) {
								this.m_listeners.add(pair);
							}
						}
						if (this.m_syncState === sap.firefly.SyncState.IN_SYNC) {
							this.onInSync();
						}
					},
					callListeners : function(allowNewListeners) {
						var sizeOfListeners;
						var offset;
						var pair;
						var data;
						var customIdentifier;
						var listener;
						this.beforeListenerCall();
						if (this.m_listeners === null) {
							return false;
						}
						sizeOfListeners = this.m_listeners.size();
						offset = 0;
						while (sizeOfListeners > offset) {
							pair = this.m_listeners.get(offset);
							this.m_listeners.removeAt(offset);
							data = this.getData();
							customIdentifier = pair.getCustomIdentifier();
							listener = pair.getListener();
							if (listener === null) {
								throw sap.firefly.XException
										.createIllegalStateException("Listener is not valid. Might be a reference counter problem");
							} else {
								if (sap.firefly.XClass
										.isXObjectReleased(listener) === false) {
									if (sap.firefly.XClass.callFunction(
											listener, this, data,
											customIdentifier) === false) {
										this.callTypedListener(this, pair
												.getListenerType(), listener,
												data, customIdentifier);
									}
								}
							}
							pair.releaseObject();
							if (allowNewListeners) {
								sizeOfListeners = this.m_listeners.size();
							} else {
								sizeOfListeners--;
							}
						}
						if (this.m_listeners !== null) {
							sizeOfListeners = this.m_listeners.size();
							if (sizeOfListeners === 0) {
								if (this.m_checkWeakConversion) {
									this.checkConversion();
									this.m_checkWeakConversion = false;
								}
								return false;
							}
							return true;
						}
						return false;
					},
					beforeListenerCall : function() {
					},
					callTypedListener : function(extResult, type, listener,
							data, customIdentifier) {
						var specificListener;
						var syncListener;
						if (type === sap.firefly.ListenerType.SPECIFIC) {
							specificListener = listener;
							this.callListener(this, specificListener, data,
									customIdentifier);
						} else {
							if (type === sap.firefly.ListenerType.SYNC_LISTENER) {
								syncListener = listener;
								syncListener.onSynchronized(this, data,
										customIdentifier);
							}
						}
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getData : function() {
						var data;
						if (this.m_dataWeakRef !== null) {
							return sap.firefly.XWeakReferenceUtil
									.getHardRef(this.m_dataWeakRef);
						}
						data = this.m_dataHardRef;
						if (this.m_isInsideListenerCall === false) {
							this.checkConversion();
						}
						return data;
					},
					setData : function(data) {
						var otherData = data;
						if (otherData === this) {
							this.m_dataWeakRef = sap.firefly.XWeakReferenceUtil
									.getWeakRef(data);
						} else {
							this.m_dataHardRef = data;
						}
					},
					checkConversion : function() {
						if (this.m_convertDataToWeak) {
							this.m_dataWeakRef = sap.firefly.XWeakReferenceUtil
									.getWeakRef(this.m_dataHardRef);
							this.m_dataHardRef = null;
						}
					},
					setAutoConvertDataToWeakRef : function(convertDataToWeakRef) {
						this.m_convertDataToWeak = convertDataToWeakRef;
					},
					isAutoConvertDataToWeakRef : function() {
						return this.m_convertDataToWeak;
					},
					getActionContext : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_actionContext);
					},
					setActionContext : function(parent) {
						this.m_actionContext = sap.firefly.XWeakReferenceUtil
								.getWeakRef(parent);
					},
					getSession : function() {
						var context = this.getActionContext();
						if (context !== null) {
							return context.getSession();
						}
						return null;
					},
					getChildSynchronizer : function() {
						return this.m_syncChild;
					},
					setSyncChild : function(syncChild) {
						this.m_syncChild = syncChild;
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var activeSyncType;
						var summary;
						buffer.append("SyncState: ");
						buffer.append(this.m_syncState.toString());
						activeSyncType = this.getActiveSyncType();
						if (activeSyncType !== null) {
							buffer.appendNewLine();
							buffer.append("SyncType: ");
							buffer.append(activeSyncType.toString());
						}
						summary = this.getSummary();
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(summary)) {
							buffer.append(summary);
						}
						return buffer.toString();
					}
				});
$Firefly.createClass("sap.firefly.XHierarchyAction", sap.firefly.SyncAction, {
	$statics : {
		createAndRun : function(session, result, listener, customIdentifier) {
			var newObj = new sap.firefly.XHierarchyAction();
			newObj.setupSynchronizingObject(session);
			newObj.setData(result);
			newObj.processSyncAction(sap.firefly.SyncType.BLOCKING, listener,
					customIdentifier);
			return newObj;
		}
	},
	callListener : function(extResult, listener, data, customIdentifier) {
		var children = null;
		if (data !== null) {
			children = data.getChildren();
		}
		listener.onChildFetched(extResult, data, children, customIdentifier);
	}
});
$Firefly.createClass("sap.firefly.PrDouble", sap.firefly.PrElement, {
	$statics : {
		create : function() {
			return new sap.firefly.PrDouble();
		},
		createWithValue : function(value) {
			var proxy = new sap.firefly.PrDouble();
			proxy.m_value = value;
			return proxy;
		}
	},
	m_value : 0,
	getPermaCopy : function() {
		return sap.firefly.PrDouble.createWithValue(this.m_value);
	},
	getType : function() {
		return sap.firefly.PrElementType.DOUBLE;
	},
	getIntegerValue : function() {
		return sap.firefly.XDouble.convertDoubleToInt(this.m_value);
	},
	getLongValue : function() {
		return sap.firefly.XDouble.convertDoubleToLong(this.m_value);
	},
	asNumber : function() {
		return this;
	},
	asDouble : function() {
		return this;
	},
	getDoubleValue : function() {
		return this.m_value;
	},
	setDoubleValue : function(doubleValue) {
		this.m_value = doubleValue;
	}
});
$Firefly.createClass("sap.firefly.PrInteger", sap.firefly.PrElement, {
	$statics : {
		create : function() {
			return new sap.firefly.PrInteger();
		},
		createWithValue : function(value) {
			var proxy = new sap.firefly.PrInteger();
			proxy.m_value = value;
			return proxy;
		}
	},
	m_value : 0,
	getPermaCopy : function() {
		return sap.firefly.PrInteger.createWithValue(this.m_value);
	},
	getType : function() {
		return sap.firefly.PrElementType.INTEGER;
	},
	getIntegerValue : function() {
		return this.m_value;
	},
	setIntegerValue : function(integerValue) {
		this.m_value = integerValue;
	},
	getLongValue : function() {
		return this.m_value;
	},
	asNumber : function() {
		return this;
	},
	asInteger : function() {
		return this;
	},
	getDoubleValue : function() {
		return this.m_value;
	}
});
$Firefly.createClass("sap.firefly.PrLong", sap.firefly.PrElement, {
	$statics : {
		create : function() {
			return new sap.firefly.PrLong();
		},
		createWithValue : function(value) {
			var newObj = new sap.firefly.PrLong();
			newObj.m_value = value;
			return newObj;
		}
	},
	m_value : 0,
	getPermaCopy : function() {
		return sap.firefly.PrLong.createWithValue(this.m_value);
	},
	getType : function() {
		return sap.firefly.PrElementType.LONG;
	},
	getIntegerValue : function() {
		return sap.firefly.XInteger.convertStringToIntegerWithDefault(
				sap.firefly.XLong.convertLongToString(this.m_value), 0);
	},
	setLongValue : function(longValue) {
		this.m_value = longValue;
	},
	asNumber : function() {
		return this;
	},
	asLong : function() {
		return this;
	},
	getDoubleValue : function() {
		return this.m_value;
	},
	getLongValue : function() {
		return this.m_value;
	}
});
$Firefly
		.createClass(
				"sap.firefly.XProperties",
				sap.firefly.XObject,
				{
					$statics : {
						create : function() {
							var properties = new sap.firefly.XProperties();
							properties.setup(null);
							return properties;
						},
						createPropertiesCopy : function(origin) {
							var properties = new sap.firefly.XProperties();
							properties.setup(origin);
							return properties;
						}
					},
					m_storage : null,
					releaseObject : function() {
						this.m_storage = sap.firefly.XObject
								.releaseIfNotNull(this.m_storage);
						sap.firefly.XProperties.$superclass.releaseObject
								.call(this);
					},
					createMapOfStringByStringCopy : function() {
						return this.m_storage.createMapOfStringByStringCopy();
					},
					setup : function(origin) {
						if (origin === null) {
							this.m_storage = sap.firefly.XHashMapOfStringByString
									.create();
						} else {
							this.m_storage = sap.firefly.XHashMapOfStringByString
									.createMapOfStringByStringStaticCopy(origin);
						}
					},
					put : function(key, element) {
						if (element === null) {
							this.m_storage.remove(key);
						} else {
							this.m_storage.put(key, element);
						}
					},
					remove : function(key) {
						this.m_storage.remove(key);
					},
					containsKey : function(key) {
						return this.m_storage.containsKey(key);
					},
					getByKey : function(key) {
						return this.m_storage.getByKey(key);
					},
					getKeysAsReadOnlyListOfString : function() {
						return this.m_storage.getKeysAsReadOnlyListOfString();
					},
					getKeysAsIteratorOfString : function() {
						return this.m_storage.getKeysAsIteratorOfString();
					},
					getValuesAsReadOnlyListOfString : function() {
						return this.m_storage.getValuesAsReadOnlyListOfString();
					},
					getIterator : function() {
						return this.m_storage.getIterator();
					},
					clear : function() {
						this.m_storage.clear();
					},
					size : function() {
						return this.m_storage.size();
					},
					isEmpty : function() {
						return this.m_storage.isEmpty();
					},
					hasElements : function() {
						return this.m_storage.hasElements();
					},
					contains : function(element) {
						return this.m_storage.contains(element);
					},
					assertNameAndGet : function(name) {
						var value = this.m_storage.getByKey(name);
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException(sap.firefly.XString
											.concatenate2(
													"Property cannot be found: ",
													name));
						}
						return value;
					},
					getIntegerByName : function(name) {
						return sap.firefly.XInteger
								.convertStringToIntegerWithRadix(this
										.assertNameAndGet(name), 10);
					},
					getIntegerByNameWithDefault : function(name, defaultValue) {
						var value = this.m_storage.getByKey(name);
						if (value === null) {
							return defaultValue;
						}
						return sap.firefly.XInteger
								.convertStringToIntegerWithDefault(value,
										defaultValue);
					},
					setIntegerByName : function(name, value) {
						this.put(name, sap.firefly.XInteger
								.convertIntegerToString(value));
					},
					getLongByName : function(name) {
						return sap.firefly.XLong.convertStringToLong(this
								.assertNameAndGet(name));
					},
					getLongByNameWithDefault : function(name, defaultValue) {
						var value = this.m_storage.getByKey(name);
						if (value === null) {
							return defaultValue;
						}
						return sap.firefly.XLong
								.convertStringToLongWithDefault(value,
										defaultValue);
					},
					setLongByName : function(name, value) {
						this.put(name, sap.firefly.XLong
								.convertLongToString(value));
					},
					getDoubleByName : function(name) {
						return sap.firefly.XDouble.convertStringToDouble(this
								.assertNameAndGet(name));
					},
					getDoubleByNameWithDefault : function(name, defaultValue) {
						var value = this.m_storage.getByKey(name);
						if (value === null) {
							return defaultValue;
						}
						return sap.firefly.XDouble
								.convertStringToDoubleWithDefault(value,
										defaultValue);
					},
					setDoubleByName : function(name, value) {
						this.put(name, sap.firefly.XDouble
								.convertDoubleToString(value));
					},
					getBooleanByName : function(name) {
						return sap.firefly.XBoolean.convertStringToBoolean(this
								.assertNameAndGet(name));
					},
					getBooleanByNameWithDefault : function(name, defaultValue) {
						var value = this.m_storage.getByKey(name);
						if (value === null) {
							return defaultValue;
						}
						return sap.firefly.XBoolean
								.convertStringToBooleanWithDefault(value,
										defaultValue);
					},
					setBooleanByName : function(name, value) {
						this.put(name, sap.firefly.XBoolean
								.convertBooleanToString(value));
					},
					getStringByName : function(name) {
						return this.getByKey(name);
					},
					getStringByNameWithDefault : function(name, defaultValue) {
						if (this.m_storage.containsKey(name)) {
							return this.m_storage.getByKey(name);
						}
						return defaultValue;
					},
					setStringByNameNotNull : function(name, value) {
						if (value !== null) {
							this.m_storage.put(name, value);
						}
					},
					setStringByName : function(name, value) {
						if (value === null) {
							this.m_storage.remove(name);
						} else {
							this.m_storage.put(name, value);
						}
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.PROPERTIES;
					},
					clone : function() {
						return sap.firefly.XProperties
								.createPropertiesCopy(this);
					},
					isEqualTo : function(other) {
						var otherProperties;
						var keys;
						var key;
						if (other === null) {
							return false;
						}
						if (this === other) {
							return true;
						}
						otherProperties = other;
						if (this.size() !== otherProperties.size()) {
							return false;
						}
						keys = this.getKeysAsIteratorOfString();
						while (keys.hasNext()) {
							key = keys.next();
							if (sap.firefly.XString.isEqual(this.getByKey(key),
									otherProperties.getByKey(key)) === false) {
								return false;
							}
						}
						keys.releaseObject();
						return true;
					},
					resetValue : function(value) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					serialize : function() {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					deserialize : function(content) {
						var normalizedContent = sap.firefly.XStringUtils
								.normalizeLineEndings(content);
						var lines = sap.firefly.XStringTokenizer.splitString(
								normalizedContent, "\n");
						var i;
						var currentLine;
						var index;
						var value;
						var name;
						for (i = 0; i < lines.size(); i++) {
							currentLine = lines.get(i);
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(currentLine)) {
								if (sap.firefly.XString.startsWith(currentLine,
										"#") === false) {
									index = sap.firefly.XString.indexOf(
											currentLine, "=");
									if (index !== -1) {
										value = sap.firefly.XString.substring(
												currentLine, index + 1, -1);
										name = sap.firefly.XString
												.trim(sap.firefly.XString
														.substring(currentLine,
																0, index));
										this.put(name, value);
									}
								}
							}
						}
					},
					getStringRepresentation : function() {
						return this.m_storage.toString();
					},
					toString : function() {
						return this.m_storage.toString();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.SyncActionSequence",
				sap.firefly.SyncAction,
				{
					$statics : {
						create : function(context) {
							var sequence = new sap.firefly.SyncActionSequence();
							sequence.setupSynchronizingObject(context);
							return sequence;
						}
					},
					m_actions : null,
					m_mainAction : null,
					setupSynchronizingObject : function(context) {
						sap.firefly.SyncActionSequence.$superclass.setupSynchronizingObject
								.call(this, context);
						this.m_actions = sap.firefly.XList.create();
					},
					releaseObject : function() {
						this.m_actions = sap.firefly.XCollectionUtils
								.releaseEntriesAndCollectionIfNotNull(this.m_actions);
						this.m_mainAction = null;
						sap.firefly.SyncActionSequence.$superclass.releaseObject
								.call(this);
					},
					addAction : function(action) {
						if (this.m_mainAction !== null) {
							throw sap.firefly.XException
									.createIllegalStateException("Main action already set.");
						}
						this.m_actions.add(action);
					},
					setMainAction : function(action) {
						this.addAction(action);
						this.m_mainAction = action;
					},
					processSynchronization : function(syncType) {
						var i;
						var syncAction;
						var data;
						var asyncAction;
						if (this.m_mainAction === null) {
							throw sap.firefly.XException
									.createIllegalStateException("Main action not set.");
						}
						if (syncType === sap.firefly.SyncType.BLOCKING) {
							for (i = 0; i < this.m_actions.size(); i++) {
								syncAction = this.m_actions.get(i);
								syncAction.processSyncGeneric(syncType, null,
										null);
								this.addAllMessages(syncAction);
								if (syncAction.hasErrors()) {
									break;
								}
							}
							data = this.m_mainAction.getData();
							this.setData(data);
							this.endSync();
							return false;
						}
						if (this.m_actions.size() > 0) {
							asyncAction = this.m_actions.get(0);
							asyncAction.processSyncGeneric(syncType, this,
									sap.firefly.XIntegerValue.create(0));
							return true;
						}
						this.endSync();
						return false;
					},
					onSynchronized : function(messages, data, customIdentifier) {
						var number;
						var numberValue;
						var isLast;
						var asyncAction;
						this.addAllMessages(messages);
						number = customIdentifier;
						numberValue = number.getIntegerValue();
						isLast = (numberValue === (this.m_actions.size() - 1));
						if (isLast) {
							this.setData(data);
						}
						if (this.isSyncCanceled()) {
							this.addError(sap.firefly.ErrorCodes.OTHER_ERROR,
									"Sequence execution cancelled");
						}
						if (isLast || (messages.hasErrors())) {
							this.endSync();
						} else {
							numberValue = numberValue + 1;
							asyncAction = this.m_actions.get(numberValue);
							asyncAction.processSyncGeneric(
									sap.firefly.SyncType.NON_BLOCKING, this,
									sap.firefly.XIntegerValue
											.create(numberValue));
						}
					},
					callListener : function(extResult, listener, data,
							customIdentifier) {
						this.m_mainAction.callListener(extResult, listener,
								data, customIdentifier);
					}
				});
$Firefly.createClass("sap.firefly.XListWeakRef", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var list = new sap.firefly.XListWeakRef();
			list.setup();
			return list;
		}
	},
	m_storage : null,
	setup : function() {
		this.m_storage = sap.firefly.XList.create();
	},
	releaseObject : function() {
		this.m_storage = sap.firefly.XObject.releaseIfNotNull(this.m_storage);
		sap.firefly.XListWeakRef.$superclass.releaseObject.call(this);
	},
	add : function(element) {
		this.m_storage.add(sap.firefly.XWeakReferenceUtil.getWeakRef(element));
	},
	addAll : function(otherList) {
		var i;
		if ((otherList !== null) && (otherList !== this)) {
			for (i = 0; i < otherList.size(); i++) {
				this.add(otherList.get(i));
			}
		}
	},
	insert : function(index, element) {
		this.m_storage.insert(index, sap.firefly.XWeakReferenceUtil
				.getWeakRef(element));
	},
	clear : function() {
		this.m_storage.clear();
	},
	get : function(index) {
		var weakRef = this.m_storage.get(index);
		return sap.firefly.XWeakReferenceUtil.getHardRef(weakRef);
	},
	getIndex : function(element) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	isEmpty : function() {
		return this.m_storage.isEmpty();
	},
	hasElements : function() {
		return this.m_storage.hasElements();
	},
	removeAt : function(index) {
		var weakRef = this.m_storage.removeAt(index);
		return sap.firefly.XWeakReferenceUtil.getHardRef(weakRef);
	},
	removeElement : function(element) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	size : function() {
		return this.m_storage.size();
	},
	contains : function(element) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	createListCopy : function() {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	sublist : function(beginIndex, endIndex) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	set : function(index, element) {
		this.m_storage.set(index, sap.firefly.XWeakReferenceUtil
				.getWeakRef(element));
	},
	getIterator : function() {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	getValuesAsReadOnlyList : function() {
		return this;
	},
	sortByComparator : function(comparator) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	sortByDirection : function(sortDirection) {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	moveElement : function(fromIndex, toIndex) {
		sap.firefly.XListUtils.moveElement(this, fromIndex, toIndex);
	},
	createArrayCopy : function() {
		throw sap.firefly.XException.createUnsupportedOperationException();
	},
	toString : function() {
		return this.m_storage.toString();
	}
});
$Firefly.createClass("sap.firefly.XSetOfNameObject", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var list = new sap.firefly.XSetOfNameObject();
			list.m_storage = sap.firefly.XHashMapByString.create();
			return list;
		}
	},
	m_storage : null,
	createSetCopy : function() {
		var copy = sap.firefly.XSetOfNameObject.create();
		var iterator = this.m_storage.getIterator();
		while (iterator.hasNext()) {
			copy.put(iterator.next());
		}
		return copy;
	},
	clone : function() {
		var clone = sap.firefly.XSetOfNameObject.create();
		var iterator = this.m_storage.getIterator();
		while (iterator.hasNext()) {
			clone.put(iterator.next().clone());
		}
		return clone;
	},
	releaseObject : function() {
		this.m_storage = sap.firefly.XObject.releaseIfNotNull(this.m_storage);
		sap.firefly.XSetOfNameObject.$superclass.releaseObject.call(this);
	},
	getValuesAsReadOnlyList : function() {
		return this.m_storage.getValuesAsReadOnlyList();
	},
	getIterator : function() {
		return this.m_storage.getIterator();
	},
	clear : function() {
		this.m_storage.clear();
	},
	size : function() {
		return this.m_storage.size();
	},
	isEmpty : function() {
		return this.m_storage.isEmpty();
	},
	hasElements : function() {
		return this.m_storage.hasElements();
	},
	contains : function(element) {
		return this.m_storage.containsKey(element.getName());
	},
	put : function(element) {
		this.m_storage.put(element.getName(), element);
	},
	removeElement : function(element) {
		this.m_storage.remove(element.getName());
	},
	addAll : function(elements) {
		var iterator = elements.getIterator();
		var value;
		while (iterator.hasNext()) {
			value = iterator.next();
			this.m_storage.put(value.getName(), value);
		}
	},
	unmodifiableSetOfNameObject : function() {
		return sap.firefly.XUnmodSetOfNameObject.create(this);
	},
	containsKey : function(key) {
		return this.m_storage.containsKey(key);
	},
	getByKey : function(key) {
		return this.m_storage.getByKey(key);
	},
	getKeysAsReadOnlyListOfString : function() {
		return this.m_storage.getKeysAsReadOnlyListOfString();
	},
	getKeysAsIteratorOfString : function() {
		return this.m_storage.getKeysAsIteratorOfString();
	},
	toString : function() {
		return this.m_storage.toString();
	}
});
$Firefly.createClass("sap.firefly.XUnmodSetOfNameObject", sap.firefly.XObject,
		{
			$statics : {
				create : function(bag) {
					var list = new sap.firefly.XUnmodSetOfNameObject();
					list.m_storage = sap.firefly.XWeakReferenceUtil
							.getWeakRef(bag);
					return list;
				}
			},
			m_storage : null,
			releaseObject : function() {
				this.m_storage = sap.firefly.XObject
						.releaseIfNotNull(this.m_storage);
				sap.firefly.XUnmodSetOfNameObject.$superclass.releaseObject
						.call(this);
			},
			getHardStorage : function() {
				return sap.firefly.XWeakReferenceUtil
						.getHardRef(this.m_storage);
			},
			getValuesAsReadOnlyList : function() {
				return this.getHardStorage().getValuesAsReadOnlyList();
			},
			getIterator : function() {
				return this.getHardStorage().getIterator();
			},
			clear : function() {
			},
			size : function() {
				return this.getHardStorage().size();
			},
			isEmpty : function() {
				return this.getHardStorage().isEmpty();
			},
			hasElements : function() {
				return this.getHardStorage().hasElements();
			},
			contains : function(element) {
				return this.getHardStorage().contains(element);
			},
			put : function(element) {
			},
			removeElement : function(element) {
			},
			addAll : function(elements) {
			},
			unmodifiableSetOfNameObject : function() {
				return this;
			},
			containsKey : function(key) {
				return this.getHardStorage().containsKey(key);
			},
			getByKey : function(key) {
				return this.getHardStorage().getByKey(key);
			},
			getKeysAsReadOnlyListOfString : function() {
				return this.getHardStorage().getKeysAsReadOnlyListOfString();
			},
			getKeysAsIteratorOfString : function() {
				return this.getHardStorage().getKeysAsIteratorOfString();
			},
			toString : function() {
				return this.getHardStorage().toString();
			},
			createSetCopy : function() {
				var copy = sap.firefly.XSetOfNameObject.create();
				var iterator = this.getHardStorage().getIterator();
				while (iterator.hasNext()) {
					copy.put(iterator.next());
				}
				return copy;
			}
		});
$Firefly
		.createClass(
				"sap.firefly.XLineStringValue",
				sap.firefly.AbstractGeometry,
				{
					$statics : {
						WKT_KEY : "LINESTRING",
						WKT_EMTPY : "EMPTY",
						WKT_OPEN_BRACKETS : "(",
						WKT_CLOSE_BRACKETS : ")",
						WKT_SEPERATOR : ",",
						create : function() {
							var newObj = new sap.firefly.XLineStringValue();
							newObj.m_storage = sap.firefly.XList.create();
							return newObj;
						},
						createWithWkt : function(wkt) {
							var newObj;
							var openingParenthesis;
							var stringPoints;
							var points;
							var i;
							var currentPoint;
							var singlePoint;
							var xPos;
							var yPos;
							if ((sap.firefly.XString.indexOf(wkt,
									sap.firefly.XLineStringValue.WKT_KEY) === -1)
									|| sap.firefly.XString.startsWith(wkt,
											"MULTILINESTRING")) {
								return null;
							}
							newObj = sap.firefly.XLineStringValue.create();
							openingParenthesis = sap.firefly.XString.indexOf(
									wkt, "(");
							stringPoints = sap.firefly.XString.substring(wkt,
									openingParenthesis + 1, sap.firefly.XString
											.size(wkt) - 1);
							points = sap.firefly.XStringTokenizer.splitString(
									stringPoints, ",");
							for (i = 0; i < points.size(); i++) {
								currentPoint = sap.firefly.XString.trim(points
										.get(i));
								singlePoint = sap.firefly.XStringTokenizer
										.splitString(currentPoint, " ");
								if (singlePoint.size() === 2) {
									xPos = sap.firefly.XDouble
											.convertStringToDouble(singlePoint
													.get(0));
									yPos = sap.firefly.XDouble
											.convertStringToDouble(singlePoint
													.get(1));
									newObj.createAndAddPoint(xPos, yPos);
								}
							}
							return newObj;
						},
						createWithPoints : function(points) {
							var newObj = new sap.firefly.XLineStringValue();
							newObj.m_storage = points;
							return newObj;
						}
					},
					m_storage : null,
					releaseObject : function() {
						this.m_storage = sap.firefly.XObject
								.releaseIfNotNull(this.m_storage);
						sap.firefly.XLineStringValue.$superclass.releaseObject
								.call(this);
					},
					toWKT : function() {
						var wkt = sap.firefly.XStringBuffer.create();
						wkt.append(sap.firefly.XLineStringValue.WKT_KEY);
						wkt.append(" ");
						if (this.m_storage.isEmpty()) {
							wkt.append(sap.firefly.XLineStringValue.WKT_EMTPY);
						} else {
							wkt
									.append(sap.firefly.XLineStringValue.WKT_OPEN_BRACKETS);
							wkt.append(this.toString());
							wkt
									.append(sap.firefly.XLineStringValue.WKT_CLOSE_BRACKETS);
						}
						return wkt.toString();
					},
					toString : function() {
						var returnString = sap.firefly.XStringBuffer.create();
						var i;
						var currentPoint;
						for (i = 0; i < this.m_storage.size(); i++) {
							currentPoint = this.m_storage.get(i);
							returnString.append(currentPoint.toString());
							if ((i + 1) < this.m_storage.size()) {
								returnString
										.append(sap.firefly.XLineStringValue.WKT_SEPERATOR);
							}
						}
						return returnString.toString();
					},
					resetValue : function(value) {
						var valueLineString;
						var i;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if (value.getValueType() !== sap.firefly.XValueType.LINE_STRING) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Parameter is no line string");
						}
						valueLineString = value;
						this.m_storage.clear();
						for (i = 0; i < valueLineString.size(); i++) {
							this.m_storage.add(valueLineString.get(i));
						}
					},
					clone : function() {
						var clone = sap.firefly.XLineStringValue.create();
						var i;
						for (i = 0; i < this.m_storage.size(); i++) {
							clone.add(this.m_storage.get(i).clone());
						}
						clone.setSrid(this.getSrid());
						return clone;
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.LINE_STRING;
					},
					createAndAddPoint : function(posX, posY) {
						var newPoint = sap.firefly.XPointValue
								.createWithPosition(posX, posY);
						this.m_storage.add(newPoint);
					},
					add : function(element) {
						this.m_storage.add(element);
					},
					addAll : function(otherList) {
						var i;
						if ((otherList !== null) && (otherList !== this)) {
							for (i = 0; i < otherList.size(); i++) {
								this.add(otherList.get(i));
							}
						}
					},
					insert : function(index, element) {
						this.m_storage.insert(index, element);
					},
					removeAt : function(index) {
						return this.m_storage.removeAt(index);
					},
					removeElement : function(element) {
						this.m_storage.removeElement(element);
					},
					getValuesAsReadOnlyList : function() {
						return this.m_storage.getValuesAsReadOnlyList();
					},
					getIterator : function() {
						return this.m_storage.getIterator();
					},
					contains : function(element) {
						return this.m_storage.contains(element);
					},
					size : function() {
						return this.m_storage.size();
					},
					isEmpty : function() {
						return this.m_storage.isEmpty();
					},
					hasElements : function() {
						return this.m_storage.hasElements();
					},
					clear : function() {
						this.m_storage.clear();
					},
					getIndex : function(element) {
						return this.m_storage.getIndex(element);
					},
					get : function(index) {
						return this.m_storage.get(index);
					},
					set : function(index, element) {
						this.m_storage.set(index, element);
					},
					createArrayCopy : function() {
						return this.m_storage.createArrayCopy();
					},
					isEqualTo : function(other) {
						var xOther;
						if (sap.firefly.XLineStringValue.$superclass.isEqualTo
								.call(this, other) === false) {
							return false;
						}
						xOther = other;
						return this.getValuesAsReadOnlyList().isEqualTo(
								xOther.getValuesAsReadOnlyList());
					},
					isClosed : function() {
						var firstPoint;
						var lastPoint;
						if (this.m_storage.isEmpty()) {
							return false;
						}
						if (this.isValid()) {
							firstPoint = this.getStartPoint();
							lastPoint = this.getEndPoint();
							return sap.firefly.XString.isEqual(firstPoint
									.toWKT(), lastPoint.toWKT());
						}
						return false;
					},
					getEndPoint : function() {
						if (this.m_storage.isEmpty()) {
							return null;
						}
						return this.m_storage.get(this.m_storage.size() - 1);
					},
					getStartPoint : function() {
						if (this.m_storage.isEmpty()) {
							return null;
						}
						return this.m_storage.get(0);
					},
					isValid : function() {
						return (this.m_storage.size() >= 2);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XMultiLineStringValue",
				sap.firefly.AbstractGeometry,
				{
					$statics : {
						WKT_KEY : "MULTILINESTRING",
						WKT_EMTPY : "EMPTY",
						WKT_OPEN_BRACKETS : "(",
						WKT_CLOSE_BRACKETS : ")",
						WKT_SEPERATOR : ",",
						create : function() {
							var newObj = new sap.firefly.XMultiLineStringValue();
							newObj.m_storage = sap.firefly.XList.create();
							return newObj;
						},
						createWithWkt : function(wkt) {
							var newObj;
							var openingParenthesis;
							var stringPoints;
							var lineStrings;
							var i;
							var currentLineString;
							var currentLineStringPoints;
							var newLineString;
							var n;
							var currentPoint;
							var singlePoint;
							var xPos;
							var yPos;
							if (sap.firefly.XString.indexOf(wkt,
									sap.firefly.XMultiLineStringValue.WKT_KEY) === -1) {
								return null;
							}
							newObj = sap.firefly.XMultiLineStringValue.create();
							openingParenthesis = sap.firefly.XString.indexOf(
									wkt, "((");
							stringPoints = sap.firefly.XString.substring(wkt,
									openingParenthesis + 1, sap.firefly.XString
											.size(wkt) - 1);
							lineStrings = sap.firefly.XStringTokenizer
									.splitString(stringPoints, "),");
							for (i = 0; i < lineStrings.size(); i++) {
								currentLineString = sap.firefly.XString
										.trim(lineStrings.get(i));
								currentLineString = sap.firefly.XString
										.replace(currentLineString, "(", "");
								currentLineString = sap.firefly.XString
										.replace(currentLineString, ")", "");
								currentLineStringPoints = sap.firefly.XStringTokenizer
										.splitString(currentLineString, ",");
								if (currentLineStringPoints !== null) {
									if ((currentLineStringPoints.size() > 0)) {
										newLineString = sap.firefly.XLineStringValue
												.create();
										for (n = 0; n < currentLineStringPoints
												.size(); n++) {
											currentPoint = sap.firefly.XString
													.trim(currentLineStringPoints
															.get(n));
											singlePoint = sap.firefly.XStringTokenizer
													.splitString(currentPoint,
															" ");
											if (singlePoint.size() === 2) {
												xPos = sap.firefly.XDouble
														.convertStringToDouble(singlePoint
																.get(0));
												yPos = sap.firefly.XDouble
														.convertStringToDouble(singlePoint
																.get(1));
												newLineString
														.createAndAddPoint(
																xPos, yPos);
											}
										}
										newObj.add(newLineString);
									}
								}
							}
							return newObj;
						},
						createWithLineStrings : function(lineStrings) {
							var newObj = new sap.firefly.XMultiLineStringValue();
							newObj.m_storage = lineStrings;
							return newObj;
						}
					},
					m_storage : null,
					releaseObject : function() {
						this.m_storage = sap.firefly.XObject
								.releaseIfNotNull(this.m_storage);
						sap.firefly.XMultiLineStringValue.$superclass.releaseObject
								.call(this);
					},
					toWKT : function() {
						var wkt = sap.firefly.XStringBuffer.create();
						wkt.append(sap.firefly.XMultiLineStringValue.WKT_KEY);
						wkt.append(" ");
						if (this.isEmpty()) {
							wkt
									.append(sap.firefly.XMultiLineStringValue.WKT_EMTPY);
						} else {
							wkt
									.append(sap.firefly.XMultiLineStringValue.WKT_OPEN_BRACKETS);
							wkt.append(this.toString());
							wkt
									.append(sap.firefly.XMultiLineStringValue.WKT_CLOSE_BRACKETS);
						}
						return wkt.toString();
					},
					toString : function() {
						var returnString = sap.firefly.XStringBuffer.create();
						var i;
						var currentLineString;
						for (i = 0; i < this.m_storage.size(); i++) {
							currentLineString = this.m_storage.get(i);
							returnString
									.append(sap.firefly.XMultiLineStringValue.WKT_OPEN_BRACKETS);
							returnString.append(currentLineString.toString());
							returnString
									.append(sap.firefly.XMultiLineStringValue.WKT_CLOSE_BRACKETS);
							if ((i + 1) < this.m_storage.size()) {
								returnString
										.append(sap.firefly.XMultiLineStringValue.WKT_SEPERATOR);
							}
						}
						return returnString.toString();
					},
					isEqualTo : function(other) {
						var xOther;
						if (sap.firefly.XMultiLineStringValue.$superclass.isEqualTo
								.call(this, other) === false) {
							return false;
						}
						xOther = other;
						return this.getValuesAsReadOnlyList().isEqualTo(
								xOther.getValuesAsReadOnlyList());
					},
					resetValue : function(value) {
						var valueMultiLineString;
						var i;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if ((value.getValueType() !== sap.firefly.XValueType.MULTI_LINE_STRING)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Parameter is no multi line string");
						}
						valueMultiLineString = value;
						this.m_storage.clear();
						for (i = 0; i < valueMultiLineString.size(); i++) {
							this.m_storage.add(valueMultiLineString.get(i));
						}
					},
					clone : function() {
						var clone = sap.firefly.XMultiLineStringValue.create();
						var i;
						for (i = 0; i < this.m_storage.size(); i++) {
							clone.add(this.m_storage.get(i).clone());
						}
						clone.setSrid(this.getSrid());
						return clone;
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.MULTI_LINE_STRING;
					},
					add : function(element) {
						this.m_storage.add(element);
					},
					addAll : function(otherList) {
						var i;
						if ((otherList !== null) && (otherList !== this)) {
							for (i = 0; i < otherList.size(); i++) {
								this.add(otherList.get(i));
							}
						}
					},
					createAndAddLineStringWithWKT : function(lineStringWkt) {
						var newLineString = sap.firefly.XLineStringValue
								.createWithWkt(lineStringWkt);
						this.m_storage.add(newLineString);
					},
					insert : function(index, element) {
						this.m_storage.insert(index, element);
					},
					removeAt : function(index) {
						return this.m_storage.removeAt(index);
					},
					removeElement : function(element) {
						this.m_storage.removeElement(element);
					},
					getValuesAsReadOnlyList : function() {
						return this.m_storage.getValuesAsReadOnlyList();
					},
					getIterator : function() {
						return this.m_storage.getIterator();
					},
					contains : function(element) {
						return this.m_storage.contains(element);
					},
					size : function() {
						return this.m_storage.size();
					},
					isEmpty : function() {
						return this.m_storage.isEmpty();
					},
					hasElements : function() {
						return this.m_storage.hasElements();
					},
					clear : function() {
						this.m_storage.clear();
					},
					getIndex : function(element) {
						return this.m_storage.getIndex(element);
					},
					get : function(index) {
						return this.m_storage.get(index);
					},
					set : function(index, element) {
						this.m_storage.set(index, element);
					},
					createArrayCopy : function() {
						return this.m_storage.createArrayCopy();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XMultiPointValue",
				sap.firefly.AbstractGeometry,
				{
					$statics : {
						WKT_START : "MULTIPOINT",
						WKT_POINT : "POINT",
						create : function() {
							var multiPoint = new sap.firefly.XMultiPointValue();
							multiPoint.m_storage = sap.firefly.XList.create();
							return multiPoint;
						},
						createWithWkt : function(wkt) {
							var multiPoint;
							var indexOf;
							var stringPoints;
							var splitString;
							var iterator;
							var stringPoint;
							var aPoint;
							if (sap.firefly.XString.indexOf(wkt,
									sap.firefly.XMultiPointValue.WKT_START) === -1) {
								return null;
							}
							multiPoint = sap.firefly.XMultiPointValue.create();
							indexOf = sap.firefly.XString.indexOf(wkt, "(");
							stringPoints = sap.firefly.XString.substring(wkt,
									indexOf + 1,
									sap.firefly.XString.size(wkt) - 1);
							splitString = sap.firefly.XStringTokenizer
									.splitString(stringPoints, ",");
							iterator = splitString.getIterator();
							while (iterator.hasNext()) {
								stringPoint = iterator.next();
								if (sap.firefly.XString.containsString(
										stringPoints, "(") === false) {
									stringPoint = sap.firefly.XString
											.concatenate2("(", stringPoint);
								}
								if (sap.firefly.XString.containsString(
										stringPoints, ")") === false) {
									stringPoint = sap.firefly.XString
											.concatenate2(stringPoint, ")");
								}
								aPoint = sap.firefly.XString.concatenate2(
										sap.firefly.XMultiPointValue.WKT_POINT,
										stringPoint);
								multiPoint.add(sap.firefly.XPointValue
										.createWithWkt(aPoint));
							}
							return multiPoint;
						}
					},
					m_storage : null,
					releaseObject : function() {
						this.m_storage = sap.firefly.XObject
								.releaseIfNotNull(this.m_storage);
						sap.firefly.XMultiPointValue.$superclass.releaseObject
								.call(this);
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.MULTI_POINT;
					},
					resetValue : function(value) {
						var otherMp;
						var pointIdx;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if (this.getValueType() !== value.getValueType()) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						otherMp = value;
						this.m_storage.clear();
						for (pointIdx = 0; pointIdx < otherMp.size(); pointIdx++) {
							this.m_storage.add(otherMp.get(pointIdx));
						}
					},
					isEqualTo : function(other) {
						var xOther;
						var pointIdx;
						if (sap.firefly.XMultiPointValue.$superclass.isEqualTo
								.call(this, other) === false) {
							return false;
						}
						xOther = other;
						if (this.m_storage.size() !== xOther.size()) {
							return false;
						}
						for (pointIdx = 0; pointIdx < this.m_storage.size(); pointIdx++) {
							if (this.m_storage.get(pointIdx).isEqualTo(
									xOther.get(pointIdx)) === false) {
								return false;
							}
						}
						return true;
					},
					clone : function() {
						var clone = sap.firefly.XMultiPointValue.create();
						var pointIdx;
						for (pointIdx = 0; pointIdx < this.m_storage.size(); pointIdx++) {
							clone.add(this.m_storage.get(pointIdx));
						}
						clone.setSrid(this.getSrid());
						return clone;
					},
					toString : function() {
						var sb = sap.firefly.XStringBuffer.create();
						var pointIdx;
						for (pointIdx = 0; pointIdx < this.m_storage.size(); pointIdx++) {
							if (pointIdx > 0) {
								sb.append(", ");
							}
							sb.append(this.m_storage.get(pointIdx).toString());
						}
						return sb.toString();
					},
					toWKT : function() {
						var sb = sap.firefly.XStringBuffer.create();
						sb.append(sap.firefly.XMultiPointValue.WKT_START);
						sb.append(" (");
						sb.append(this.toString());
						sb.append(")");
						return sb.toString();
					},
					add : function(element) {
						this.m_storage.add(element);
					},
					addAll : function(otherList) {
						var i;
						if ((otherList !== null) && (otherList !== this)) {
							for (i = 0; i < otherList.size(); i++) {
								this.add(otherList.get(i));
							}
						}
					},
					insert : function(index, element) {
						this.m_storage.insert(index, element);
					},
					removeAt : function(index) {
						return this.m_storage.removeAt(index);
					},
					removeElement : function(element) {
						this.m_storage.removeElement(element);
					},
					getValuesAsReadOnlyList : function() {
						return this.m_storage.getValuesAsReadOnlyList();
					},
					getIterator : function() {
						return this.m_storage.getIterator();
					},
					contains : function(element) {
						return this.m_storage.contains(element);
					},
					size : function() {
						return this.m_storage.size();
					},
					isEmpty : function() {
						return this.m_storage.isEmpty();
					},
					hasElements : function() {
						return this.m_storage.hasElements();
					},
					clear : function() {
						this.m_storage.clear();
					},
					getIndex : function(element) {
						return this.m_storage.getIndex(element);
					},
					get : function(index) {
						return this.m_storage.get(index);
					},
					set : function(index, element) {
						this.m_storage.set(index, element);
					},
					createArrayCopy : function() {
						return this.m_storage.createArrayCopy();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.XMultiPolygonValue",
				sap.firefly.AbstractGeometry,
				{
					$statics : {
						WKT_START : "MULTIPOLYGON",
						WKT_POLY_START : "POLYGON ",
						create : function() {
							var multiPolygon = new sap.firefly.XMultiPolygonValue();
							multiPolygon.setup();
							return multiPolygon;
						},
						createWithWkt : function(wkt) {
							var multiPolygon;
							var openingParenthesis;
							var stringPolygons;
							var polygons;
							var polyIterator;
							var buffer;
							var polygon;
							if (sap.firefly.XString.indexOf(wkt,
									sap.firefly.XMultiPolygonValue.WKT_START) === -1) {
								return null;
							}
							multiPolygon = sap.firefly.XMultiPolygonValue
									.create();
							openingParenthesis = sap.firefly.XString.indexOf(
									wkt, "(((");
							stringPolygons = sap.firefly.XString.substring(wkt,
									openingParenthesis + 1, sap.firefly.XString
											.size(wkt) - 1);
							polygons = sap.firefly.XStringTokenizer
									.splitString(stringPolygons, ")),");
							polyIterator = polygons.getIterator();
							while (polyIterator.hasNext()) {
								buffer = sap.firefly.XStringBuffer.create();
								buffer
										.append(sap.firefly.XMultiPolygonValue.WKT_POLY_START);
								buffer.append(polyIterator.next());
								buffer.append("))");
								polygon = sap.firefly.XPolygonValue
										.createWithWkt(buffer.toString());
								multiPolygon.add(polygon);
							}
							multiPolygon.finalizeMultiPolygon();
							return multiPolygon;
						}
					},
					m_storage : null,
					m_isFinalized : false,
					setup : function() {
						this.m_storage = sap.firefly.XList.create();
						this.m_isFinalized = false;
					},
					releaseObject : function() {
						this.m_storage = sap.firefly.XObject
								.releaseIfNotNull(this.m_storage);
						sap.firefly.XMultiPolygonValue.$superclass.releaseObject
								.call(this);
					},
					finalizeMultiPolygon : function() {
						var size;
						var polygon;
						var i;
						if (this.isFinalized() === false) {
							size = this.m_storage.size();
							for (i = 0; i < size; i++) {
								polygon = this.m_storage.get(i);
								polygon.finalizePolygon();
							}
							this.m_isFinalized = true;
						}
					},
					clone : function() {
						var clone = sap.firefly.XMultiPolygonValue.create();
						var polyIdx;
						for (polyIdx = 0; polyIdx < this.m_storage.size(); polyIdx++) {
							clone.add(this.m_storage.get(polyIdx));
						}
						if (this.isFinalized()) {
							clone.finalizeMultiPolygon();
						}
						clone.setSrid(this.getSrid());
						return clone;
					},
					resetValue : function(value) {
						var valueMultiPoly;
						var polyIdx;
						if (value === null) {
							throw sap.firefly.XException
									.createIllegalArgumentException("illegal value");
						}
						if (this === value) {
							return;
						}
						if ((value.getValueType() !== sap.firefly.XValueType.MULTI_POLYGON)) {
							throw sap.firefly.XException
									.createIllegalArgumentException("Parameter is no multipolygon");
						}
						if (this.isFinalized()) {
							throw sap.firefly.XException
									.createIllegalStateException("Can't reset finalized multipolygon");
						}
						valueMultiPoly = value;
						this.m_storage.clear();
						for (polyIdx = 0; polyIdx < valueMultiPoly.size(); polyIdx++) {
							this.m_storage.add(valueMultiPoly.get(polyIdx));
						}
					},
					isEqualTo : function(other) {
						var xOther;
						var polyIdx;
						if (sap.firefly.XMultiPolygonValue.$superclass.isEqualTo
								.call(this, other) === false) {
							return false;
						}
						xOther = other;
						if (this.isFinalized() !== xOther.isFinalized()) {
							return false;
						}
						if (this.m_storage.size() !== xOther.size()) {
							return false;
						}
						for (polyIdx = 0; polyIdx < this.m_storage.size(); polyIdx++) {
							if (this.m_storage.get(polyIdx).isEqualTo(
									xOther.get(polyIdx)) === false) {
								return false;
							}
						}
						return true;
					},
					toWKT : function() {
						var wktBuffer = sap.firefly.XStringBuffer.create();
						wktBuffer
								.append(sap.firefly.XMultiPolygonValue.WKT_START);
						wktBuffer.append(" ");
						wktBuffer.append(this.toString());
						return wktBuffer.toString();
					},
					getComponentType : function() {
						return this.getValueType();
					},
					getValueType : function() {
						return sap.firefly.XValueType.MULTI_POLYGON;
					},
					isFinalized : function() {
						return this.m_isFinalized;
					},
					add : function(element) {
						if (this.m_isFinalized === false) {
							this.m_storage.add(element);
						}
					},
					addAll : function(otherList) {
						var i;
						if ((otherList !== null) && (otherList !== this)) {
							for (i = 0; i < otherList.size(); i++) {
								this.add(otherList.get(i));
							}
						}
					},
					insert : function(index, element) {
						if (this.m_isFinalized === false) {
							this.m_storage.insert(index, element);
						}
					},
					removeAt : function(index) {
						if (this.m_isFinalized) {
							return null;
						}
						return this.m_storage.removeAt(index);
					},
					removeElement : function(element) {
						if (this.m_isFinalized === false) {
							this.m_storage.removeElement(element);
						}
					},
					getValuesAsReadOnlyList : function() {
						return this.m_storage.getValuesAsReadOnlyList();
					},
					getIterator : function() {
						return this.m_storage.getIterator();
					},
					contains : function(element) {
						return this.m_storage.contains(element);
					},
					size : function() {
						return this.m_storage.size();
					},
					isEmpty : function() {
						return this.m_storage.isEmpty();
					},
					hasElements : function() {
						return this.m_storage.hasElements();
					},
					clear : function() {
						if (this.m_isFinalized === false) {
							this.m_storage.clear();
						}
					},
					getIndex : function(element) {
						return this.m_storage.getIndex(element);
					},
					get : function(index) {
						return this.m_storage.get(index);
					},
					set : function(index, element) {
						if (this.m_isFinalized === false) {
							this.m_storage.set(index, element);
						}
					},
					createArrayCopy : function() {
						return this.m_storage.createArrayCopy();
					},
					toString : function() {
						var buffer = sap.firefly.XStringBuffer.create();
						var polyIdx;
						buffer.append("(");
						for (polyIdx = 0; polyIdx < this.m_storage.size(); polyIdx++) {
							if (polyIdx > 0) {
								buffer.append(", ");
							}
							buffer.append(this.m_storage.get(polyIdx)
									.toString());
						}
						buffer.append(")");
						return buffer.toString();
					}
				});
$Firefly.createClass("sap.firefly.XListOfNameObject", sap.firefly.XObject, {
	$statics : {
		create : function() {
			var list = new sap.firefly.XListOfNameObject();
			list.setup();
			return list;
		}
	},
	m_map : null,
	m_storage : null,
	setup : function() {
		this.m_map = sap.firefly.XWeakMap.create();
		this.m_storage = sap.firefly.XList.create();
	},
	releaseObject : function() {
		this.m_storage = sap.firefly.XObject.releaseIfNotNull(this.m_storage);
		this.m_map = sap.firefly.XObject.releaseIfNotNull(this.m_map);
		sap.firefly.XListOfNameObject.$superclass.releaseObject.call(this);
	},
	containsKey : function(key) {
		return this.m_map.containsKey(key);
	},
	getByKey : function(key) {
		return this.m_map.getByKey(key);
	},
	getKeysAsReadOnlyListOfString : function() {
		var result = sap.firefly.XListOfString.create();
		var size = this.m_storage.size();
		var i;
		var name;
		for (i = 0; i < size; i++) {
			name = this.m_storage.get(i).getName();
			if (name !== null) {
				result.add(name);
			}
		}
		return result;
	},
	getValuesAsReadOnlyList : function() {
		return this.m_storage.getValuesAsReadOnlyList();
	},
	getKeysAsIteratorOfString : function() {
		return this.m_map.getKeysAsIteratorOfString();
	},
	getIterator : function() {
		return this.m_storage.getIterator();
	},
	add : function(element) {
		var name;
		if (element !== null) {
			this.m_storage.add(element);
			name = (element).getName();
			if (name !== null) {
				this.m_map.put(name, element);
			}
		}
	},
	addAll : function(otherList) {
		var i;
		if ((otherList !== null) && (otherList !== this)) {
			for (i = 0; i < otherList.size(); i++) {
				this.add(otherList.get(i));
			}
		}
	},
	insert : function(index, element) {
		var name;
		if (element !== null) {
			this.m_storage.insert(index, element);
			name = (element).getName();
			if (name !== null) {
				this.m_map.put(name, element);
			}
		}
	},
	set : function(index, element) {
		var name;
		if (element !== null) {
			this.m_storage.set(index, element);
			name = (element).getName();
			if (name !== null) {
				this.m_map.put(name, element);
			}
		}
	},
	removeAt : function(index) {
		var removed = this.m_storage.get(index);
		var objAtIndex = this.m_storage.removeAt(index);
		var name = (removed).getName();
		if (name !== null) {
			this.m_map.remove(name);
		}
		return objAtIndex;
	},
	removeElement : function(element) {
		var name;
		if (element !== null) {
			this.m_storage.removeElement(element);
			name = (element).getName();
			if (name !== null) {
				this.m_map.remove(name);
			}
		}
	},
	moveElement : function(fromIndex, toIndex) {
		this.m_storage.moveElement(fromIndex, toIndex);
	},
	get : function(index) {
		return this.m_storage.get(index);
	},
	getIndex : function(element) {
		return this.m_storage.getIndex(element);
	},
	clear : function() {
		this.m_storage.clear();
		this.m_map.clear();
	},
	size : function() {
		return this.m_storage.size();
	},
	isEmpty : function() {
		return this.m_storage.isEmpty();
	},
	hasElements : function() {
		return this.m_storage.hasElements();
	},
	sortByComparator : function(comparator) {
		this.m_storage.sortByComparator(comparator);
	},
	sortByDirection : function(sortDirection) {
		this.m_storage.sortByDirection(sortDirection);
	},
	createListCopy : function() {
		return this.m_storage.createListCopy();
	},
	sublist : function(beginIndex, endIndex) {
		return this.m_storage.sublist(beginIndex, endIndex);
	},
	contains : function(element) {
		return this.m_storage.contains(element);
	},
	createArrayCopy : function() {
		return this.m_storage.createArrayCopy();
	},
	toString : function() {
		return this.m_storage.toString();
	}
});
$Firefly
		.createClass(
				"sap.firefly.CoreExtModule",
				sap.firefly.DfModule,
				{
					$statics : {
						s_module : null,
						getInstance : function() {
							return sap.firefly.CoreExtModule
									.initVersion(sap.firefly.XVersion.API_DEFAULT);
						},
						initVersion : function(version) {
							var set;
							if (sap.firefly.CoreExtModule.s_module === null) {
								if (sap.firefly.CoreModule.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								if (sap.firefly.PlatformModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								sap.firefly.CoreExtModule.s_module = new sap.firefly.CoreExtModule();
								set = sap.firefly.XSetOfNameObject.create();
								sap.firefly.XComponentType
										.staticSetupComponentType(set);
								sap.firefly.XValueType.staticSetup();
								sap.firefly.XEnvironment.staticSetup();
								sap.firefly.PrElementType.staticSetup();
								sap.firefly.SyncType.staticSetup();
								sap.firefly.SyncState.staticSetup();
								sap.firefly.LifeCycleState.staticSetup();
								sap.firefly.Dispatcher.staticSetup();
								sap.firefly.WorkingTaskManager.staticSetup();
								sap.firefly.ChildSetState.staticSetup();
								sap.firefly.ListenerType.staticSetup();
							}
							return sap.firefly.CoreExtModule.s_module;
						}
					}
				});
sap.firefly.CoreExtModule.getInstance();