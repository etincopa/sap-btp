$Firefly
		.createClass(
				"sap.firefly.ReferenceGrid",
				sap.firefly.XObject,
				{
					$statics : {
						SEP_VERT_TOP : "/",
						SEP_VERT_BOTTOM : "~",
						SEP_VERT : ":",
						COLUMN : "|",
						ROW : "~",
						MAGIC_CELL_DIV : "/",
						LINEFEED : "\r\n",
						S_MAX_GRID_SIZE : 100000,
						create : function(resultSet) {
							var object = new sap.firefly.ReferenceGrid();
							object.setupSimpleGrid(resultSet, false);
							return object;
						},
						createWithDetails : function(resultSet) {
							var object = new sap.firefly.ReferenceGrid();
							object.setupSimpleGrid(resultSet, true);
							return object;
						},
						createWithName : function(gridName, resultSet) {
							var object = new sap.firefly.ReferenceGrid();
							object.setupSimpleGrid(resultSet, false);
							return object;
						},
						createWithNameAndDetails : function(gridName, resultSet) {
							var object = new sap.firefly.ReferenceGrid();
							object.setupSimpleGrid(resultSet, true);
							return object;
						},
						getCellValueWithDetails : function(dataCell) {
							var sb = sap.firefly.XStringBuffer.create();
							var queryManager = dataCell.getQueryModel()
									.getQueryManager();
							var qDataCell = dataCell.getDataCell();
							var decimalPlaces;
							var currencyUnit;
							var valueException;
							var maxAlertLevel;
							var newValue;
							var inputReadinessState;
							if (qDataCell !== null) {
								sb.append("(DataCell->");
								sb.append(qDataCell.getName());
								sb.append(")");
							}
							decimalPlaces = dataCell.getDecimalPlaces();
							if (decimalPlaces !== 0) {
								sb.append("(Decimal Places=");
								sb.appendInt(decimalPlaces);
								sb.append(")");
							}
							if (dataCell.isDataEntryEnabled()) {
								sb.append("I:");
							}
							if (dataCell.isValueLocked()) {
								sb.append("L:");
							}
							currencyUnit = dataCell.getCurrencyUnit();
							if ((currencyUnit !== null)
									&& (currencyUnit.hasPrefix())) {
								sb.append(currencyUnit.getPrefix());
								sb.append(" ");
							}
							sb.append(dataCell.getFormattedValue());
							if ((currencyUnit !== null)
									&& (currencyUnit.hasSuffix())) {
								sb.append(" ");
								sb.append(currencyUnit.getSuffix());
							}
							valueException = dataCell.getValueException();
							if (valueException !== sap.firefly.ValueException.NORMAL) {
								sb.append("|");
								if (valueException === null) {
									sb.append("<null>");
								} else {
									sb.append(valueException.getName());
								}
							}
							maxAlertLevel = dataCell.getMaxAlertLevel();
							if (maxAlertLevel !== sap.firefly.AlertLevel.NORMAL) {
								sb.append("|[");
								if (maxAlertLevel === null) {
									sb.append("<null>");
								} else {
									sb.append(maxAlertLevel.getName());
								}
								sb.append("]");
							}
							if (dataCell.isValueChanged()) {
								sb.append("|N:");
								newValue = dataCell.getXValue();
								if (newValue === null) {
									sb.append("<null>");
								} else {
									sb
											.append(newValue.getValueType()
													.getName());
									if (newValue.getValueType() === sap.firefly.XValueType.STRING) {
										sb.append(" ");
										sb.append((newValue).getStringValue());
									}
								}
							}
							if (dataCell.isNewValueForced()) {
								sb.append("|F:");
							}
							sb.append("|");
							sb.append(dataCell.getValueType().getName());
							sb.append("|");
							sb.append(dataCell.getFormatString());
							if ((currencyUnit !== null)
									&& (!currencyUnit.isEmpty())) {
								sb.append("|");
								if (currencyUnit.isMixed()) {
									sb.append("M:");
								} else {
									if (currencyUnit.hasUnit()) {
										sb.append("U:");
									} else {
										if (currencyUnit.hasCurrency()) {
											sb.append("C:");
										}
									}
								}
								if (currencyUnit.hasFormatted()) {
									sb.append(currencyUnit.getFormatted());
								} else {
									sb.append("<null>");
								}
							}
							if (queryManager.supportsInputReadinessStates()
									&& dataCell.getQueryModel()
											.isDataEntryEnabled()) {
								inputReadinessState = dataCell
										.getInputReadinessState();
								if (inputReadinessState !== null) {
									sb.append("|");
									sb.append("S:");
									sb
											.appendInt(inputReadinessState
													.getIndex());
								}
							}
							return sb.toString();
						},
						getCellValue : function(formattedValue, dataCell) {
							var valueException = dataCell.getValueException();
							var exceptionText = null;
							var alertLevelText = null;
							var maxAlertLevel;
							var buffer;
							if ((valueException === sap.firefly.ValueException.NULL_VALUE)
									|| (valueException === sap.firefly.ValueException.UNDEFINED)) {
								return "";
							} else {
								if ((valueException !== sap.firefly.ValueException.NORMAL)
										&& (valueException !== sap.firefly.ValueException.ZERO)) {
									exceptionText = valueException.getName();
								}
							}
							maxAlertLevel = dataCell.getMaxAlertLevel();
							if (maxAlertLevel !== sap.firefly.AlertLevel.NORMAL) {
								alertLevelText = maxAlertLevel.getName();
							}
							if ((exceptionText !== null)
									|| (alertLevelText !== null)) {
								buffer = sap.firefly.XStringBuffer.create();
								buffer.append(formattedValue);
								if (alertLevelText !== null) {
									buffer.append(" [");
									buffer.append(alertLevelText);
									buffer.append("]");
								}
								if (exceptionText !== null) {
									buffer.append(" [");
									buffer.append(exceptionText);
									buffer.append("]");
								}
								return buffer.toString();
							}
							return formattedValue;
						}
					},
					m_cells : null,
					m_fixedWidth : 0,
					m_fixedHeight : 0,
					m_resultSet : null,
					m_createFingerprint : false,
					m_fingerprint : null,
					m_withDetails : false,
					setupSimpleGrid : function(resultSet, withDetails) {
						this.m_resultSet = resultSet;
						this.m_withDetails = withDetails;
					},
					releaseObject : function() {
						var size0;
						var x;
						var size1;
						var y;
						var cell;
						if (this.m_cells !== null) {
							size0 = this.m_cells.size0();
							for (x = 0; x < size0; x++) {
								size1 = this.m_cells.size1();
								for (y = 0; y < size1; y++) {
									cell = this.m_cells.getByIndices(x, y);
									if (cell !== null) {
										cell.releaseObject();
										this.m_cells.setByIndices(x, y, null);
									}
								}
							}
							this.m_cells.releaseObject();
							this.m_cells = null;
						}
						this.m_resultSet = null;
						this.m_fingerprint = null;
						sap.firefly.ReferenceGrid.$superclass.releaseObject
								.call(this);
					},
					exportToFingerprint : function() {
						this.m_createFingerprint = true;
						this.m_fingerprint = "--empty--";
						this.prepareCellStructure(true, true);
						return this.m_fingerprint;
					},
					checkMaxGridSize : function() {
						var colCount;
						var rowCount;
						var message;
						var size;
						if (this.m_cells !== null) {
							colCount = this.m_cells.size0();
							rowCount = this.m_cells.size1();
							message = sap.firefly.XStringBuffer.create();
							if ((colCount > 0) && (rowCount > 0)) {
								size = colCount * rowCount;
								if (size > sap.firefly.ReferenceGrid.S_MAX_GRID_SIZE) {
									message.append("Grid size ");
									message.appendInt(size);
									message
											.append(" is above maximum grid size ");
									message
											.appendInt(sap.firefly.ReferenceGrid.S_MAX_GRID_SIZE);
									throw sap.firefly.XException
											.createRuntimeException(message
													.toString());
								}
							} else {
								if ((colCount > sap.firefly.ReferenceGrid.S_MAX_GRID_SIZE)
										|| (rowCount > sap.firefly.ReferenceGrid.S_MAX_GRID_SIZE)) {
									if (colCount > sap.firefly.ReferenceGrid.S_MAX_GRID_SIZE) {
										message.append("Column size ");
										message.appendInt(colCount);
									} else {
										message.append("Row size ");
										message.appendInt(rowCount);
									}
									message
											.append(" is above maximum grid size ");
									message
											.appendInt(sap.firefly.ReferenceGrid.S_MAX_GRID_SIZE);
									throw sap.firefly.XException
											.createRuntimeException(message
													.toString());
								}
							}
						}
					},
					setMaxColumnSize : function(maxCellSize, columns, rowStart,
							maxRowCount) {
						var colCount = this.m_cells.size0();
						var idxCol;
						var max;
						for (idxCol = 0; idxCol < colCount; idxCol++) {
							max = this.getColumnMaxCharacters(idxCol, rowStart,
									maxRowCount);
							if ((maxCellSize !== -1) && (max > maxCellSize)) {
								max = maxCellSize;
							}
							columns.set(idxCol, max);
						}
					},
					exportToAscii : function(maxCellSize) {
						return this.exportToAsciiExt(maxCellSize, true, true,
								0, -1, 0, -1);
					},
					exportBodyColumns : function(maxCellSize,
							useColumnsHeaderPane, columnStart, maxColumnCount) {
						return this.exportToAsciiExt(maxCellSize, false,
								useColumnsHeaderPane, 0, -1, columnStart,
								maxColumnCount);
					},
					exportBodyRows : function(maxCellSize, useRowsHeaderPane,
							rowStart, maxRowCount) {
						return this.exportToAsciiExt(maxCellSize,
								useRowsHeaderPane, false, rowStart,
								maxRowCount, 0, -1);
					},
					exportToAsciiExt : function(maxCellSize, useRowsHeaderPane,
							useColumnsHeaderPane, rowStart, maxRowCount,
							columnStart, maxColumnCount) {
						var buffer;
						var totalCols;
						var totalRows;
						var columns;
						var linesBySeparator;
						var idxRow;
						var idxCol;
						var rowCounter;
						var colCounter;
						var cell;
						var rest;
						var charCount;
						var states;
						this.prepareCellStructure(useRowsHeaderPane,
								useColumnsHeaderPane);
						this.checkMaxGridSize();
						if (this.m_cells === null) {
							return "[empty]";
						}
						buffer = sap.firefly.XStringBuffer.create();
						totalCols = this.m_cells.size0();
						totalRows = this.m_cells.size1();
						columns = sap.firefly.XArrayOfInt.create(totalCols);
						linesBySeparator = sap.firefly.XHashMapOfStringByString
								.create();
						this.setMaxColumnSize(maxCellSize, columns, rowStart,
								maxRowCount);
						rowCounter = 0;
						for (idxRow = rowStart; (idxRow < totalRows)
								&& ((maxRowCount === -1) || (rowCounter < maxRowCount)); idxRow++) {
							if (rowCounter > 0) {
								buffer
										.append(sap.firefly.ReferenceGrid.LINEFEED);
							}
							if ((idxRow === this.m_fixedHeight)
									&& (useColumnsHeaderPane)) {
								buffer.append(this.renderLine(linesBySeparator,
										columns,
										sap.firefly.ReferenceGrid.SEP_VERT_TOP,
										columnStart, maxColumnCount));
								buffer
										.append(sap.firefly.ReferenceGrid.LINEFEED);
							}
							colCounter = 0;
							for (idxCol = columnStart; (idxCol < totalCols)
									&& ((maxColumnCount === -1) || (colCounter < maxColumnCount)); idxCol++) {
								if (colCounter > 0) {
									if (idxCol === this.m_fixedWidth) {
										buffer
												.append(sap.firefly.ReferenceGrid.SEP_VERT);
									} else {
										buffer
												.append(sap.firefly.ReferenceGrid.COLUMN);
									}
								}
								cell = this.m_cells
										.getByIndices(idxCol, idxRow);
								rest = columns.get(idxCol);
								if (cell === null) {
									buffer.append(sap.firefly.XStringUtils
											.leftPad("", " ", rest));
								} else {
									charCount = sap.firefly.XMath.getMinimum(
											rest, cell.getCharacterCount());
									rest = rest - charCount;
									if (cell.isLeftAligned()) {
										buffer.append(sap.firefly.XStringUtils
												.rightPad(cell
														.getText(charCount),
														" ", rest));
									} else {
										buffer.append(sap.firefly.XStringUtils
												.leftPad(cell
														.getText(charCount),
														" ", rest));
									}
								}
								colCounter++;
							}
							rowCounter++;
						}
						if ((totalRows > 0) && (useColumnsHeaderPane)) {
							buffer.append(sap.firefly.ReferenceGrid.LINEFEED);
							buffer.append(this.renderLine(linesBySeparator,
									columns,
									sap.firefly.ReferenceGrid.SEP_VERT_BOTTOM,
									columnStart, maxColumnCount));
						}
						if (this.m_withDetails
								&& this.m_resultSet.getQueryManager()
										.supportsInputReadinessStates()) {
							states = this.exportInputReadinessStatesToAscii();
							if (states !== null) {
								buffer.appendNewLine();
								buffer.append(states);
							}
						}
						return buffer.toString();
					},
					exportInputReadinessStatesToAscii : function() {
						var readinessStates;
						var buffer;
						var stateIterator;
						var state;
						var typeIterator;
						var type;
						var parameterIterator;
						if (this.m_resultSet.getQueryModel()
								.isDataEntryEnabled() === false) {
							return null;
						}
						readinessStates = this.m_resultSet
								.getInputReadinessStates();
						if (readinessStates === null) {
							return null;
						}
						buffer = sap.firefly.XStringBuffer.create();
						buffer.append("InputReadinessStates:[ ");
						stateIterator = readinessStates.getIterator();
						while (stateIterator.hasNext()) {
							state = stateIterator.next();
							buffer.appendInt(state.getIndex()).append(":[");
							typeIterator = state.getInputReadinessTypes()
									.getIterator();
							while (typeIterator.hasNext()) {
								type = typeIterator.next();
								buffer.append(type.getName());
								if (state.getParameterByType(type) !== null) {
									buffer.append("([");
									parameterIterator = state
											.getParameterByType(type)
											.getIterator();
									while (parameterIterator.hasNext()) {
										buffer.append(parameterIterator.next());
										if (parameterIterator.hasNext()) {
											buffer.append(", ");
										}
									}
									buffer.append("])");
								}
								if (typeIterator.hasNext()) {
									buffer.append(", ");
								}
							}
							buffer.append("]");
							if (stateIterator.hasNext()) {
								buffer.append(", ");
							}
						}
						buffer.append(" ]");
						return buffer.toString();
					},
					prepareCellStructure : function(useRowsHeaderPane,
							useColumnsHeaderPane) {
						if ((this.m_cells === null)
								&& (this.m_resultSet !== null)) {
							this.prepareStructure(useRowsHeaderPane,
									useColumnsHeaderPane);
						}
					},
					prepareStructure : function(useRowsHeaderPane,
							useColumnsHeaderPane) {
						var columnsAxis = this.m_resultSet.getColumnsAxis();
						var colMaxCount = sap.firefly.XMath.getMaximum(
								columnsAxis.getDataCount(), columnsAxis
										.getTuplesCount());
						var rowsAxis;
						var rowDataCount;
						var rowTupleCount;
						var rowMaxCount;
						var totalColumns;
						var totalRows;
						if (useColumnsHeaderPane) {
							this.m_fixedHeight = sap.firefly.XMath.getMaximum(
									this.getEffectiveFieldSize(columnsAxis), 1);
						} else {
							this.m_fixedHeight = 0;
						}
						rowsAxis = this.m_resultSet.getRowsAxis();
						rowDataCount = rowsAxis.getDataCount();
						rowTupleCount = rowsAxis.getTuplesCount();
						rowMaxCount = sap.firefly.XMath.getMaximum(
								rowDataCount, rowTupleCount);
						if (useRowsHeaderPane) {
							this.m_fixedWidth = sap.firefly.XMath.getMaximum(
									this.getEffectiveFieldSize(rowsAxis), 1);
						} else {
							this.m_fixedWidth = 0;
						}
						totalColumns = this.m_fixedWidth + colMaxCount;
						totalRows = this.m_fixedHeight + rowMaxCount;
						this.m_cells = sap.firefly.XArray2Dim.create(
								totalColumns, totalRows);
						this.setDataCells();
						if (useRowsHeaderPane) {
							this.setHeaderCells(rowsAxis, this.m_fixedHeight);
						}
						if (useColumnsHeaderPane) {
							this.setHeaderCells(columnsAxis, this.m_fixedWidth);
						}
						if (useRowsHeaderPane && useColumnsHeaderPane) {
							this
									.setTitleCells(rowsAxis,
											this.m_fixedHeight - 1);
							this.setTitleCells(columnsAxis,
									this.m_fixedWidth - 1);
						}
					},
					getEffectiveFieldSize : function(axis) {
						var effectiveSize = 0;
						var rsDimensions = axis.getRsDimensions();
						var dimensionSize = rsDimensions.size();
						var idxDim;
						var resultSetFields;
						for (idxDim = 0; idxDim < dimensionSize; idxDim++) {
							resultSetFields = rsDimensions.get(idxDim)
									.getVisibleFields();
							effectiveSize = effectiveSize
									+ resultSetFields.size();
						}
						return effectiveSize;
					},
					setTitleCells : function(axis, offset) {
						var type = axis.getType();
						var rsDimensions = axis.getRsDimensions();
						var position = 0;
						var buffer = sap.firefly.XStringBuffer.create();
						var dimSize = rsDimensions.size();
						var idxDim;
						var rsDimension;
						var dimension;
						var visibleFields;
						var fieldSize;
						var idxField;
						var field;
						var existingCell;
						var simpleName;
						for (idxDim = 0; idxDim < dimSize; idxDim++) {
							rsDimension = rsDimensions.get(idxDim);
							dimension = rsDimension.getDimension();
							visibleFields = rsDimension.getVisibleFields();
							fieldSize = visibleFields.size();
							for (idxField = 0; idxField < fieldSize; idxField++) {
								field = visibleFields.get(idxField);
								if (dimension !== null) {
									if (dimension.isMeasureStructure()) {
										if (idxField === 0) {
											buffer.append("Measures");
										}
									} else {
										if (dimension.isStructure()) {
											if (idxField === 0) {
												buffer.append("Structure");
											}
										} else {
											if (idxField === 0) {
												buffer.append(dimension
														.getName());
												buffer.append(".[");
											} else {
												buffer.append("[");
											}
											buffer.append(field.getName());
											buffer.append("]");
										}
									}
								} else {
									buffer.append("[");
									buffer.append(field.getName());
									buffer.append("]");
								}
								if (type === sap.firefly.AxisType.ROWS) {
									this
											.setCell(
													position,
													offset,
													sap.firefly.ReferenceGridCell
															.create(
																	buffer
																			.toString(),
																	true, field),
													false);
								} else {
									existingCell = this.m_cells.getByIndices(
											offset, position);
									if (existingCell !== null) {
										simpleName = buffer.toString();
										buffer.clear();
										buffer.append(existingCell.toString());
										buffer
												.append(sap.firefly.ReferenceGrid.MAGIC_CELL_DIV);
										buffer.append(simpleName);
									}
									this.setCell(offset, position,
											sap.firefly.ReferenceGridCell
													.create(buffer.toString(),
															true, field), true);
								}
								buffer.clear();
								position++;
							}
						}
					},
					setDataCells : function() {
						var dc = this.m_resultSet.getDataColumns();
						var dr = this.m_resultSet.getDataRows();
						var y;
						var x;
						var dataCell;
						var cellValue;
						var cell;
						for (y = 0; y < dr; y++) {
							for (x = 0; x < dc; x++) {
								dataCell = this.m_resultSet.getDataCell(x, y);
								if (this.m_withDetails) {
									cellValue = sap.firefly.ReferenceGrid
											.getCellValueWithDetails(dataCell);
								} else {
									cellValue = sap.firefly.ReferenceGrid
											.getCellValue(dataCell
													.getFormattedValue(),
													dataCell);
								}
								cell = sap.firefly.ReferenceGridCell.create(
										cellValue, false, dataCell);
								this.setCell(x + this.m_fixedWidth, y
										+ this.m_fixedHeight, cell, false);
							}
						}
					},
					addCell : function(axisType, position, tupleIndex,
							tupleOffset, cell) {
						if (axisType === sap.firefly.AxisType.ROWS) {
							this.setCell(position, tupleIndex + tupleOffset,
									cell, false);
						} else {
							this.setCell(tupleIndex + tupleOffset, position,
									cell, false);
						}
					},
					setHeaderCells : function(axis, tupleOffset) {
						var rsDimensions = axis.getRsDimensions();
						var type = axis.getType();
						var tuplesCount = axis.getTuplesCount();
						var formattedValue = sap.firefly.XStringBuffer.create();
						var tupleIndex;
						var tuple;
						var position;
						var hasTotals;
						var isTotalsSet;
						var tupleSize;
						var tupleElementIndex;
						var rsDimension;
						var element;
						var rsVisibleFields;
						var visibleFieldCount;
						var dimensionMember;
						var memberType;
						var resultCell;
						var fieldIndex;
						var currentField;
						var fieldValue;
						var value;
						var memberCell;
						for (tupleIndex = 0; tupleIndex < tuplesCount; tupleIndex++) {
							tuple = axis.getTupleByIndex(tupleIndex);
							position = 0;
							hasTotals = false;
							isTotalsSet = false;
							tupleSize = tuple.size();
							for (tupleElementIndex = 0; tupleElementIndex < tupleSize; tupleElementIndex++) {
								rsDimension = rsDimensions
										.get(tupleElementIndex);
								element = tuple
										.getElementByIndex(tupleElementIndex);
								rsVisibleFields = rsDimension
										.getVisibleFields();
								visibleFieldCount = rsVisibleFields.size();
								if (element.getFirstTuple() === tuple) {
									dimensionMember = element
											.getDimensionMember();
									formattedValue.clear();
									memberType = dimensionMember
											.getMemberType();
									if (memberType.isResult()) {
										if ((hasTotals === false)
												|| (isTotalsSet === false)) {
											if ((visibleFieldCount > 0)
													&& (isTotalsSet === false)) {
												if (memberType === sap.firefly.MemberType.CONDITION_RESULT) {
													formattedValue
															.append("[Totals Included]");
												} else {
													if (memberType === sap.firefly.MemberType.CONDITION_OTHERS_RESULT) {
														formattedValue
																.append("[Totals Remaining]");
													} else {
														formattedValue
																.append("[Totals]");
													}
												}
												this
														.appendAlertLevelToValue(
																element,
																formattedValue);
												resultCell = sap.firefly.ReferenceGridCell
														.create(formattedValue
																.toString(),
																true,
																dimensionMember);
												this
														.addCell(type,
																position,
																tupleIndex,
																tupleOffset,
																resultCell);
												formattedValue.clear();
												isTotalsSet = true;
											}
										}
										hasTotals = true;
										position = position + visibleFieldCount;
									} else {
										for (fieldIndex = 0; fieldIndex < visibleFieldCount; fieldIndex++) {
											currentField = rsVisibleFields
													.get(fieldIndex);
											fieldValue = dimensionMember
													.getFieldValue(currentField);
											if (fieldValue === null) {
												formattedValue.append("[null]");
											} else {
												if (fieldValue.getValueType() === sap.firefly.XValueType.DOUBLE) {
													value = fieldValue
															.getDoubleValue();
													formattedValue
															.append(sap.firefly.XNumberFormatter
																	.formatDoubleToString(
																			value,
																			"#.0000"));
												} else {
													formattedValue
															.append(fieldValue
																	.getFormattedValue());
												}
											}
											if (fieldIndex === 0) {
												this
														.prependToFirstField(
																element,
																formattedValue);
												this
														.appendAlertLevelToValue(
																element,
																formattedValue);
											}
											memberCell = sap.firefly.ReferenceGridCell
													.create(formattedValue
															.toString(), true,
															dimensionMember);
											formattedValue.clear();
											this.addCell(type, position,
													tupleIndex, tupleOffset,
													memberCell);
											position++;
										}
									}
								} else {
									position = position + visibleFieldCount;
								}
							}
						}
					},
					appendAlertLevelToValue : function(element, formattedValue) {
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(element
										.getExceptionName())) {
							formattedValue.append(" [");
							formattedValue.appendInt(element.getAlertLevel());
							formattedValue.append("]");
						}
					},
					prependToFirstField : function(element, formattedValue) {
						var displayLevel = element.getDisplayLevel();
						var drillState = element.getDrillState();
						var oldValue;
						var i;
						if ((displayLevel > 0)
								|| (drillState !== sap.firefly.DrillState.LEAF)) {
							oldValue = formattedValue.toString();
							formattedValue.clear();
							for (i = 0; i < displayLevel; i++) {
								formattedValue.append("  ");
							}
							if (drillState === sap.firefly.DrillState.COLLAPSED) {
								formattedValue.append("+ ");
							} else {
								if (drillState === sap.firefly.DrillState.EXPANDED) {
									formattedValue.append("- ");
								}
							}
							formattedValue.append(oldValue);
						}
					},
					setCell : function(idxCol, colRow, cell, overwriteAllowed) {
						var buffer;
						var check;
						if (this.m_createFingerprint) {
							buffer = sap.firefly.XStringBuffer.create();
							buffer.append(this.m_fingerprint);
							buffer.append("x:");
							buffer.appendInt(idxCol);
							buffer.append("y:");
							buffer.appendInt(colRow);
							buffer.append(cell.getText(-1));
							this.m_fingerprint = sap.firefly.XString
									.createSHA1(buffer.toString());
						} else {
							if (overwriteAllowed === false) {
								check = this.m_cells.getByIndices(idxCol,
										colRow);
								if (check !== null) {
									throw sap.firefly.XException
											.createIllegalStateException("Double entry");
								}
							}
							this.m_cells.setByIndices(idxCol, colRow, cell);
						}
					},
					getColumnCount : function() {
						return this.m_cells.size0();
					},
					getRowCount : function() {
						return this.m_cells.size1();
					},
					getFixedColumnsCount : function() {
						return this.m_fixedWidth;
					},
					getFixedRowsCount : function() {
						return this.m_fixedHeight;
					},
					getColumnMaxCharacters : function(column, rowStart,
							maxRowCount) {
						var max = 0;
						var totalRows = this.m_cells.size1();
						var row;
						var rowCounter = 0;
						var cell;
						var c;
						for (row = rowStart; (row < totalRows)
								&& ((maxRowCount === -1) || (rowCounter < maxRowCount)); row++) {
							cell = this.m_cells.getByIndices(column, row);
							if (cell !== null) {
								c = cell.getCharacterCount();
								if (c > max) {
									max = c;
								}
							}
							rowCounter++;
						}
						return max;
					},
					getSimpleCell : function(column, row) {
						return this.m_cells.getByIndices(column, row);
					},
					renderLine : function(linesBySeparator, columns,
							verticalSeparator, columnStart, maxColumnCount) {
						var line = linesBySeparator.getByKey(verticalSeparator);
						var buffer;
						var totalColumns;
						var idxCol;
						var colCount;
						var rest;
						var z;
						if (line === null) {
							buffer = sap.firefly.XStringBuffer.create();
							totalColumns = columns.size();
							colCount = 0;
							for (idxCol = columnStart; (idxCol < totalColumns)
									&& ((maxColumnCount === -1) || (colCount < maxColumnCount)); idxCol++) {
								if (colCount > 0) {
									if (idxCol === this.m_fixedWidth) {
										buffer.append(verticalSeparator);
									} else {
										buffer
												.append(sap.firefly.ReferenceGrid.ROW);
									}
								}
								rest = columns.get(idxCol);
								for (z = 0; z < rest; z++) {
									buffer
											.append(sap.firefly.ReferenceGrid.ROW);
								}
								colCount++;
							}
							line = buffer.toString();
							linesBySeparator.put(verticalSeparator, line);
						}
						return line;
					}
				});
$Firefly.createClass("sap.firefly.ReferenceGridCell", sap.firefly.XObject, {
	$statics : {
		create : function(content, isLeftAligned, modelComponent) {
			var object = new sap.firefly.ReferenceGridCell();
			object.setup(content, isLeftAligned, modelComponent);
			return object;
		}
	},
	m_content : null,
	m_isLeftAligned : false,
	m_modelComponent : null,
	setup : function(content, isLeftAligned, modelComponent) {
		this.m_content = content;
		this.m_isLeftAligned = isLeftAligned;
		this.m_modelComponent = modelComponent;
	},
	releaseObject : function() {
		this.m_content = null;
		this.m_modelComponent = null;
		sap.firefly.ReferenceGridCell.$superclass.releaseObject.call(this);
	},
	getCharacterCount : function() {
		if (this.m_content === null) {
			return 0;
		}
		return sap.firefly.XString.size(this.m_content);
	},
	isLeftAligned : function() {
		return this.m_isLeftAligned;
	},
	getText : function(max) {
		var len;
		if (this.m_content === null) {
			return "";
		}
		len = sap.firefly.XString.size(this.m_content);
		if (len > max) {
			return sap.firefly.XString.substring(this.m_content, 0, max);
		}
		return this.m_content;
	},
	getModelComponent : function() {
		return this.m_modelComponent;
	},
	toString : function() {
		if (this.m_content === null) {
			return "";
		}
		return this.m_content;
	}
});
$Firefly
		.createClass(
				"sap.firefly.ReferencePlanningCommand",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(command) {
							var referenceModel = new sap.firefly.ReferencePlanningCommand();
							referenceModel.setup(command);
							return referenceModel;
						},
						exportCommand : function(command, jsonStructure) {
							var commandIdentifier;
							var commandType;
							var commandStructure;
							var planningAction;
							var planningOperation;
							if (command === null) {
								return;
							}
							commandIdentifier = command.getCommandIdentifier();
							commandType = commandIdentifier
									.getPlanningCommandType();
							if (commandType === null) {
								return;
							}
							commandStructure = jsonStructure
									.setNewStructureByName(commandType
											.toString());
							if (commandType === sap.firefly.PlanningCommandType.PLANNING_ACTION) {
								planningAction = command;
								sap.firefly.ReferencePlanningCommand
										.exportActionMetadata(planningAction
												.getActionIdentifier(),
												commandStructure);
							}
							if ((commandType === sap.firefly.PlanningCommandType.PLANNING_FUNCTION)
									|| (commandType === sap.firefly.PlanningCommandType.PLANNING_SEQUENCE)) {
								planningOperation = command;
								sap.firefly.ReferencePlanningCommand
										.exportOperationMetadata(
												planningOperation
														.getPlanningOperationMetadata(),
												commandStructure);
							}
							sap.firefly.ReferenceQueryModel.exportSelector(
									command.getSelector(), commandStructure,
									"Selector");
							sap.firefly.ReferenceQueryModel.exportVariables(
									command, commandStructure, "Variables");
						},
						exportActionMetadata : function(metadata, jsonStructure) {
							var actionType;
							if (metadata === null) {
								return;
							}
							jsonStructure.setStringByName("ID", metadata
									.getActionId());
							jsonStructure.setStringByName("Name", metadata
									.getActionName());
							jsonStructure.setStringByName("Description",
									metadata.getActionDescription());
							actionType = metadata.getActionType();
							if (actionType !== null) {
								jsonStructure.setStringByName("Type",
										actionType.toString());
							}
							if (metadata.isDefault()) {
								jsonStructure.setBooleanByName("Default", true);
							}
						},
						exportOperationMetadata : function(metadata,
								jsonStructure) {
							var operationIdentifier;
							var operationType;
							var operationName;
							if (metadata === null) {
								return;
							}
							operationIdentifier = metadata
									.getPlanningOperationIdentifier();
							if (operationIdentifier === null) {
								return;
							}
							operationType = operationIdentifier
									.getPlanningOperationType();
							if (operationType === null) {
								return;
							}
							jsonStructure.setStringByName("Operation Type",
									operationType.toString());
							operationName = operationIdentifier
									.getPlanningOperationName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(operationName)) {
								jsonStructure.setStringByName("Name",
										operationName);
							}
							if (operationType === sap.firefly.PlanningOperationType.PLANNING_FUNCTION) {
								sap.firefly.ReferencePlanningCommand
										.exportFunctionMetadata(metadata,
												jsonStructure);
							}
							if (operationType === sap.firefly.PlanningOperationType.PLANNING_SEQUENCE) {
								sap.firefly.ReferencePlanningCommand
										.exportSequenceMetadata(metadata,
												jsonStructure);
							}
						},
						exportFunctionMetadata : function(metadata,
								jsonStructure) {
							var bdsStructure;
							var baseDataSource;
							if (metadata === null) {
								return;
							}
							bdsStructure = jsonStructure
									.setNewStructureByName("Base Data Source");
							baseDataSource = metadata.getBaseDataSource();
							sap.firefly.ReferencePlanningCommand
									.exportBaseDataSource(baseDataSource,
											bdsStructure);
						},
						exportBaseDataSource : function(baseDataSource,
								jsonStructure) {
							if (baseDataSource === null) {
								return;
							}
							jsonStructure.setStringByName(
									"Full Qualified Name", baseDataSource
											.getFullQualifiedName());
						},
						exportSequenceMetadata : function(metadata,
								jsonStructure) {
							var stepList = jsonStructure
									.setNewListByName("Steps");
							var stepMetadataList = metadata
									.getStepMetadataList();
							var i;
							var stepStructure;
							var stepMetadata;
							if (stepMetadataList !== null) {
								for (i = 0; i < stepMetadataList.size(); i++) {
									stepStructure = stepList.addNewStructure();
									stepMetadata = stepMetadataList.get(i);
									sap.firefly.ReferencePlanningCommand
											.exportStepMetadata(stepMetadata,
													stepStructure);
								}
							}
						},
						exportStepMetadata : function(stepMetadata,
								jsonStructure) {
							var stepType;
							var bdsStructure;
							if (stepMetadata === null) {
								return;
							}
							jsonStructure.setIntegerByName("Step Number",
									stepMetadata.getNumber());
							stepType = stepMetadata.getType();
							if (stepType !== null) {
								jsonStructure.setStringByName("Step Type",
										stepType.toString());
							}
							bdsStructure = jsonStructure
									.setNewStructureByName("Base Data Source");
							sap.firefly.ReferencePlanningCommand
									.exportBaseDataSource(stepMetadata
											.getBaseDataSource(), bdsStructure);
						}
					},
					m_command : null,
					setup : function(command) {
						this.m_command = command;
					},
					exportToAscii : function() {
						var jsonStructure = this.exportToJson();
						return sap.firefly.PrToString.serialize(jsonStructure,
								true, true, 4);
					},
					exportToJson : function() {
						var jsonStructure = sap.firefly.PrStructure.create();
						sap.firefly.ReferencePlanningCommand.exportCommand(
								this.m_command, jsonStructure);
						return jsonStructure;
					},
					releaseObject : function() {
						this.m_command = null;
						sap.firefly.ReferencePlanningCommand.$superclass.releaseObject
								.call(this);
					},
					toString : function() {
						return this.exportToAscii();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ReferencePlanningContext",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(planningContext, retrieveAllMetadata) {
							var referenceModel = new sap.firefly.ReferencePlanningContext();
							referenceModel.setup(planningContext,
									retrieveAllMetadata);
							return referenceModel;
						},
						exportContext : function(planningContext, jsonStructure) {
							var changedDataStructrue;
							var supportsChangedData;
							var workStatusStructrue;
							var supportsWorkStatus;
							var planningContextType;
							if (planningContext === null) {
								return;
							}
							sap.firefly.ReferencePlanningContext
									.exportPlanningService(
											planningContext,
											jsonStructure
													.setNewStructureByName("Planning Service"));
							changedDataStructrue = jsonStructure
									.setNewStructureByName("Changed Data");
							supportsChangedData = planningContext
									.supportsChangedData();
							changedDataStructrue.setBooleanByName("Supported",
									supportsChangedData);
							if (supportsChangedData) {
								changedDataStructrue.setBooleanByName("Active",
										planningContext.hasChangedData());
							}
							workStatusStructrue = jsonStructure
									.setNewStructureByName("Work Status");
							supportsWorkStatus = planningContext
									.supportsWorkStatus();
							workStatusStructrue.setBooleanByName("Supported",
									supportsWorkStatus);
							if (supportsWorkStatus) {
								workStatusStructrue.setBooleanByName("Active",
										planningContext.isWorkStatusActive());
							}
							sap.firefly.ReferencePlanningContext.exportQueries(
									planningContext, jsonStructure);
							planningContextType = planningContext
									.getPlanningContextType();
							if (planningContextType === null) {
								jsonStructure
										.setNullByName("Planning Context Type");
								return;
							}
							jsonStructure.setStringByName(
									"Planning Context Type",
									planningContextType.toString());
							if (planningContextType === sap.firefly.PlanningContextType.DATA_AREA) {
								sap.firefly.ReferencePlanningContext
										.exportDataArea(
												planningContext,
												jsonStructure
														.setNewStructureByName("Data Area"));
							} else {
								if (planningContextType === sap.firefly.PlanningContextType.PLANNING_MODEL) {
									sap.firefly.ReferencePlanningContext
											.exportPlanningModel(
													planningContext,
													jsonStructure
															.setNewStructureByName("Planning Model"));
								} else {
									throw sap.firefly.XException
											.createIllegalStateException("Illegal planning context type");
								}
							}
						},
						exportQueries : function(planningContext, jsonStructure) {
							var queriesList = jsonStructure
									.setNewListByName("Query Consumer Services");
							var queryServices = planningContext
									.getQueryConsumerServices();
							var i;
							var queryStructure;
							var queryManager;
							var lifeCycleState;
							var syncState;
							var queryModel;
							var dataSource;
							var planningMode;
							if (queryServices === null) {
								return;
							}
							for (i = 0; i < queryServices.size(); i++) {
								queryStructure = queriesList.addNewStructure();
								queryManager = queryServices.get(i);
								lifeCycleState = queryManager
										.getLifeCycleState();
								if (lifeCycleState === null) {
									queryStructure
											.setNullByName("Query Manager Lifecycle State");
								} else {
									queryStructure.setStringByName(
											"Query Manager Lifecycle State",
											lifeCycleState.getName());
								}
								syncState = queryManager
										.getResultSetSyncState();
								if (syncState === null) {
									queryStructure
											.setNullByName("Resultset Sync State");
								} else {
									queryStructure.setStringByName(
											"Resultset Sync State", syncState
													.getName());
								}
								queryModel = queryManager.getQueryModel();
								dataSource = queryModel.getDataSource();
								queryStructure.setStringByName(
										"Query Data Source", dataSource
												.getFullQualifiedName());
								planningMode = queryManager.getPlanningMode();
								if ((planningMode !== null)
										&& (planningMode !== sap.firefly.PlanningMode.FOR_PRIVATE_VERSIONS_ONLY)) {
									queryStructure.setStringByName(
											"Planning Mode", planningMode
													.getName());
								}
							}
						},
						exportDataArea : function(dataArea, jsonStructure) {
							var cellLockingType;
							jsonStructure.setStringByName("Data Area Name",
									dataArea.getDataArea());
							cellLockingType = dataArea.getCellLockingType();
							if (cellLockingType === null) {
								jsonStructure
										.setNullByName("Cell Locking Type");
							} else {
								jsonStructure.setStringByName(
										"Cell Locking Type", cellLockingType
												.getName());
							}
							jsonStructure.setStringByName("Environment",
									dataArea.getEnvironment());
							jsonStructure.setStringByName("Model", dataArea
									.getModel());
						},
						exportPlanningModel : function(planningModel,
								jsonStructure) {
							var planningModelBehaviour;
							jsonStructure.setStringByName(
									"Planning Model Schema", planningModel
											.getPlanningModelSchema());
							jsonStructure.setStringByName(
									"Planning Model Name", planningModel
											.getPlanningModelName());
							planningModelBehaviour = planningModel
									.getPlanningModelBehaviour();
							if (planningModelBehaviour === null) {
								jsonStructure
										.setNullByName("Planning Model Behaviour");
							} else {
								jsonStructure.setStringByName(
										"Planning Model Behaviour",
										planningModelBehaviour.getName());
							}
							sap.firefly.ReferencePlanningContext
									.exportPlanningActions(planningModel,
											jsonStructure);
							sap.firefly.ReferencePlanningContext
									.exportVersionParametersMetadata(
											planningModel, jsonStructure);
							sap.firefly.ReferencePlanningContext
									.exportPlanningVersions(planningModel,
											jsonStructure);
							sap.firefly.ReferencePlanningContext
									.exportVersionPrivileges(planningModel,
											jsonStructure);
							sap.firefly.ReferencePlanningContext
									.exportQueryDataSources(planningModel,
											jsonStructure);
						},
						exportVersionParametersMetadata : function(
								planningModel, jsonStructure) {
							var versionParameterTemplates;
							var versionParameterTemplatesStructure;
							var versionParameterNames;
							var j;
							var versionParameterName;
							var versionParameterTemplateStructrue;
							var versionParameterTemplate;
							if (planningModel.supportsVersionParameters() === false) {
								return;
							}
							jsonStructure.setBooleanByName(
									"Planning Version Parameters Supported",
									true);
							versionParameterTemplates = planningModel
									.getVersionParametersMetadata();
							if (versionParameterTemplates === null) {
								jsonStructure
										.setNullByName("Planning Version Parameters Metadata");
							} else {
								versionParameterTemplatesStructure = jsonStructure
										.setNewStructureByName("Planning Version Parameters Metadata");
								versionParameterNames = versionParameterTemplates
										.getKeysAsReadOnlyListOfString();
								for (j = 0; j < versionParameterNames.size(); j++) {
									versionParameterName = versionParameterNames
											.get(j);
									versionParameterTemplateStructrue = versionParameterTemplatesStructure
											.setNewStructureByName(versionParameterName);
									versionParameterTemplate = versionParameterTemplates
											.getByKey(versionParameterName);
									versionParameterTemplateStructrue
											.setStringByName("Description",
													versionParameterTemplate
															.getDescription());
									versionParameterTemplateStructrue
											.setStringByName("Type",
													versionParameterTemplate
															.getType());
									versionParameterTemplateStructrue
											.setBooleanByName("Value Allowed",
													versionParameterTemplate
															.isValueAllowed());
									versionParameterTemplateStructrue
											.setBooleanByName("Has Value",
													versionParameterTemplate
															.hasValue());
									if (versionParameterTemplate.getValue() !== null) {
										versionParameterTemplateStructrue
												.setElementByName(
														"Value",
														sap.firefly.PrElement
																.deepCopyElement(versionParameterTemplate
																		.getValue()));
									}
								}
							}
						},
						exportVersionPrivileges : function(planningModel,
								jsonStructure) {
							var versionPrivilegesList;
							var versionPrivileges;
							var i;
							if (planningModel.supportsVersionPrivileges() === false) {
								return;
							}
							if (planningModel.isVersionPrivilegesInitialized() === false) {
								return;
							}
							if (planningModel.hasChangedVersionPrivileges()) {
								jsonStructure.setBooleanByName(
										"Planning Version Privileges Changed",
										true);
							}
							versionPrivilegesList = jsonStructure
									.setNewListByName("Planning Version Privileges");
							versionPrivileges = planningModel
									.getVersionPrivileges();
							if (versionPrivileges === null) {
								return;
							}
							for (i = 0; i < versionPrivileges.size(); i++) {
								sap.firefly.ReferencePlanningContext
										.exportVersionPrivilege(
												versionPrivileges.get(i),
												versionPrivilegesList
														.addNewStructure());
							}
						},
						exportVersionPrivilege : function(versionPrivilege,
								jsonStructure) {
							var privilege;
							var privilegeState;
							var dataSource;
							jsonStructure.setStringByName("Grantee",
									versionPrivilege.getGrantee());
							privilege = versionPrivilege.getPrivilege();
							if (privilege !== null) {
								jsonStructure.setStringByName("Privilege",
										privilege.getName());
							}
							privilegeState = versionPrivilege
									.getPrivilegeState();
							if (privilegeState !== null) {
								jsonStructure.setStringByName(
										"Privilege State", privilegeState
												.getName());
							}
							dataSource = versionPrivilege.getQueryDataSource();
							if (dataSource !== null) {
								jsonStructure.setStringByName(
										"Query Data Source", dataSource
												.getFullQualifiedName());
							}
							if (versionPrivilege.isSharedVersion()) {
								jsonStructure
										.setStringByName("Version Id",
												versionPrivilege
														.getVersionUniqueName());
							} else {
								jsonStructure.setIntegerByName("Version Id",
										versionPrivilege.getVersionId());
							}
						},
						exportQueryDataSources : function(planningModel,
								jsonStructure) {
							var dataSourcesList = jsonStructure
									.setNewListByName("Query Data Sources");
							var queryDataSourceList = planningModel
									.getQueryDataSources();
							var i;
							var queryDataSource;
							if (queryDataSourceList === null) {
								return;
							}
							for (i = 0; i < queryDataSourceList.size(); i++) {
								queryDataSource = queryDataSourceList.get(i);
								dataSourcesList
										.addString(queryDataSource
												.getDataSource()
												.getFullQualifiedName());
							}
						},
						exportPlanningVersions : function(planningModel,
								jsonStructure) {
							var versionList = jsonStructure
									.setNewListByName("Planning Versions");
							var planningVersionList = planningModel
									.getAllVersions();
							var i;
							var versionStructure;
							var planningVersion;
							var versionState;
							var privilege;
							var versionParameters;
							var versionParametersStructure;
							var versionParameterNames;
							var j;
							var versionParameterName;
							var versionParameterValue;
							var actionSequenceId;
							if (planningVersionList === null) {
								return;
							}
							for (i = 0; i < planningVersionList.size(); i++) {
								versionStructure = versionList
										.addNewStructure();
								planningVersion = planningVersionList.get(i);
								if (planningVersion.isSharedVersion()) {
									versionStructure.setStringByName(
											"Version Id", planningVersion
													.getVersionUniqueName());
								} else {
									versionStructure.setIntegerByName(
											"Version Id", planningVersion
													.getVersionId());
								}
								versionStructure.setStringByName(
										"Version Description", planningVersion
												.getVersionDescription());
								versionState = planningVersion
										.getVersionState();
								if (versionState === null) {
									versionStructure
											.setNullByName("Version State");
								} else {
									versionStructure.setStringByName(
											"Version State", versionState
													.getName());
									privilege = planningVersion.getPrivilege();
									if (privilege === null) {
										versionStructure
												.setNullByName("Version Privilege");
									} else {
										if (privilege !== sap.firefly.PlanningPrivilege.OWNER) {
											versionStructure.setStringByName(
													"Version Privilege",
													privilege.getName());
										}
									}
								}
								versionStructure.setBooleanByName(
										"Version State Active", planningVersion
												.isActive());
								if (planningModel.supportsVersionParameters()) {
									versionParameters = planningVersion
											.getParameters();
									if (versionParameters === null) {
										versionStructure
												.setNullByName("Version Parameters");
									} else {
										versionParametersStructure = versionStructure
												.setNewStructureByName("Version Parameters");
										versionParameterNames = versionParameters
												.getKeysAsReadOnlyListOfString();
										for (j = 0; j < versionParameterNames
												.size(); j++) {
											versionParameterName = versionParameterNames
													.get(j);
											versionParameterValue = versionParameters
													.getByKey(versionParameterName);
											versionParametersStructure
													.setStringByName(
															versionParameterName,
															versionParameterValue);
										}
									}
								}
								actionSequenceId = planningVersion
										.getActionSequenceId();
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(actionSequenceId)) {
									versionStructure.setStringByName(
											"Action-Sequence Id",
											actionSequenceId);
								}
								if (planningVersion.isActionSequenceActive()) {
									versionStructure.setBooleanByName(
											"Action-Sequence Is Active", true);
								}
								if (planningVersion
										.getActionSequenceCreateTime() !== null) {
									versionStructure
											.setBooleanByName(
													"Action-Sequence Create Time Available",
													true);
								}
								if (planningVersion.isActionActive()) {
									versionStructure.setBooleanByName(
											"Action Is Active", true);
								}
								if (planningVersion.getActionStartTime() !== null) {
									versionStructure
											.setBooleanByName(
													"Action Start Time Is Active",
													true);
								}
								if (planningVersion.getActionEndTime() !== null) {
									versionStructure.setBooleanByName(
											"Action End Time Is Active", true);
								}
								if (planningVersion.getUserName() !== null) {
									versionStructure.setBooleanByName(
											"User Name Available", true);
								}
							}
						},
						exportPlanningActions : function(planningModel,
								jsonStructure) {
							var actionList = jsonStructure
									.setNewListByName("Planning Actions");
							var actionMetadataList = planningModel
									.getActionMetadataList();
							var i;
							var actionStructure;
							var metadata;
							var actionType;
							var metadataBase;
							var actionParameterMetadata;
							var parametersMetadata;
							if (actionMetadataList === null) {
								return;
							}
							for (i = 0; i < actionMetadataList.size(); i++) {
								actionStructure = actionList.addNewStructure();
								metadata = actionMetadataList.get(i);
								actionStructure.setStringByName("Action Id",
										metadata.getActionId());
								actionStructure.setStringByName("Action Name",
										metadata.getActionName());
								actionStructure.setStringByName(
										"Action Description", metadata
												.getActionDescription());
								actionType = metadata.getActionType();
								if (actionType === null) {
									actionStructure
											.setNullByName("Action Type");
								} else {
									actionStructure
											.setStringByName("Action Type",
													actionType.getName());
								}
								if (metadata.isDefault()) {
									actionStructure.setBooleanByName(
											"Is Default Action", true);
								}
								metadataBase = metadata;
								if (metadataBase.isActionParameterMetadataSet()) {
									actionParameterMetadata = metadataBase
											.getActionParameterMetadata();
									parametersMetadata = actionParameterMetadata
											.getParameters();
									if (parametersMetadata !== null) {
										actionStructure
												.setElementByName(
														"Parameters Metadata",
														sap.firefly.PrList
																.createDeepCopy(parametersMetadata));
									}
								}
							}
						},
						exportPlanningService : function(planningContext,
								jsonStructure) {
							var planningService = planningContext
									.getPlanningService();
							var config;
							var properties;
							var keys;
							var keysSorted;
							var propertiesStructure;
							var i;
							var key;
							var value;
							if (planningService === null) {
								return;
							}
							config = planningService.getPlanningServiceConfig();
							if (config === null) {
								return;
							}
							properties = config.getProperties();
							if (properties === null) {
								return;
							}
							keys = properties.getKeysAsReadOnlyListOfString();
							keysSorted = sap.firefly.XListOfString
									.createFromReadOnlyList(keys);
							keysSorted
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							propertiesStructure = jsonStructure
									.setNewStructureByName("Properties");
							for (i = 0; i < keysSorted.size(); i++) {
								key = keysSorted.get(i);
								value = properties.getByKey(key);
								propertiesStructure.setStringByName(key, value);
							}
						}
					},
					m_planningContext : null,
					setup : function(planningContext, retrieveAllMetadata) {
						var planningModel;
						var actionMetadataList;
						var i;
						var actionMetadata;
						var actionParametersResult;
						this.m_planningContext = planningContext;
						if (retrieveAllMetadata) {
							if (this.m_planningContext !== null) {
								if (this.m_planningContext
										.getPlanningContextType() === sap.firefly.PlanningContextType.PLANNING_MODEL) {
									planningModel = this.m_planningContext;
									actionMetadataList = planningModel
											.getActionMetadataList();
									if (actionMetadataList !== null) {
										for (i = 0; i < actionMetadataList
												.size(); i++) {
											actionMetadata = actionMetadataList
													.get(i);
											actionParametersResult = actionMetadata
													.getActionParameters();
											if (actionParametersResult
													.hasErrors()) {
												throw sap.firefly.XException
														.createRuntimeException(actionParametersResult
																.getSummary());
											}
										}
									}
								}
							}
						}
					},
					exportToAscii : function() {
						var jsonStructure = this.exportToJson();
						return sap.firefly.PrToString.serialize(jsonStructure,
								true, true, 4);
					},
					exportToJson : function() {
						var jsonStructure = sap.firefly.PrStructure.create();
						sap.firefly.ReferencePlanningContext.exportContext(
								this.m_planningContext, jsonStructure);
						return jsonStructure;
					},
					releaseObject : function() {
						this.m_planningContext = null;
						sap.firefly.ReferencePlanningContext.$superclass.releaseObject
								.call(this);
					},
					toString : function() {
						return this.exportToAscii();
					}
				});
$Firefly
		.createClass(
				"sap.firefly.ReferenceQueryModel",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(queryModel) {
							var referenceModel = new sap.firefly.ReferenceQueryModel();
							referenceModel.setup(queryModel);
							return referenceModel;
						},
						setBoolIfTrue : function(structure, name, flag) {
							if (flag) {
								structure.setBooleanByName(name, true);
							}
						},
						setBoolIfFalse : function(structure, name, flag) {
							if (!flag) {
								structure.setBooleanByName(name, false);
							}
						},
						setNameIfNotNull : function(structure, name,
								namedObject) {
							if (namedObject !== null) {
								structure.setStringByName(name, namedObject
										.getName());
							}
						},
						setNameOrNull : function(structure, name, namedObject) {
							if (namedObject === null) {
								structure.setNullByName(name);
							} else {
								structure.setStringByName(name, namedObject
										.getName());
							}
						},
						setConstantByName : function(structure, name, constant) {
							if (constant === null) {
								structure.setNullByName(name);
							} else {
								structure.setStringByName(name, constant
										.toString());
							}
						},
						exportDataSource : function(queryModel,
								queryModelStructure) {
							var datasource = queryModel.getDataSource();
							var dataSourceText;
							if (datasource === null) {
								queryModelStructure.setNullByName("Identifier");
							} else {
								queryModelStructure.setStringByName(
										"Identifier", datasource
												.getFullQualifiedName());
								dataSourceText = datasource.getText();
								if (sap.firefly.XStringUtils
										.isNotNullAndNotEmpty(dataSourceText)) {
									queryModelStructure.setStringByName(
											"Identifier Description",
											dataSourceText);
								}
							}
						},
						exportResultAlignments : function(queryModel,
								queryModelStructure, buffer) {
							var resultAlignments;
							var lenAlignment;
							var resultAlignmentIndex;
							var resultAlignment;
							buffer.clear();
							resultAlignments = queryModel
									.getSupportedResultAlignments();
							if (sap.firefly.XCollectionUtils
									.hasElements(resultAlignments)) {
								lenAlignment = resultAlignments.size();
								for (resultAlignmentIndex = 0; resultAlignmentIndex < lenAlignment; resultAlignmentIndex++) {
									resultAlignment = resultAlignments
											.get(resultAlignmentIndex);
									if (resultAlignment === null) {
										continue;
									}
									if (buffer.length() > 0) {
										buffer.append(",");
									}
									buffer.append(resultAlignment.toString());
								}
								if (buffer.length() > 0) {
									queryModelStructure.setStringByName(
											"Result Alignments", buffer
													.toString());
								}
							}
						},
						exportConditionalResults : function(queryModel,
								queryModelStructure, buffer) {
							var conditionalResults;
							var lenConditionalResult;
							var conditionalResultIndex;
							var conditionalResult;
							buffer.clear();
							conditionalResults = queryModel
									.getSupportedConditionalResults();
							if (sap.firefly.XCollectionUtils
									.hasElements(conditionalResults)) {
								lenConditionalResult = conditionalResults
										.size();
								for (conditionalResultIndex = 0; conditionalResultIndex < lenConditionalResult; conditionalResultIndex++) {
									conditionalResult = conditionalResults
											.get(conditionalResultIndex);
									if (conditionalResult === null) {
										continue;
									}
									if (buffer.length() > 0) {
										buffer.append(",");
									}
									buffer.append(conditionalResult.toString());
								}
								if (buffer.length() > 0) {
									queryModelStructure.setStringByName(
											"Conditional Results", buffer
													.toString());
								}
							}
						},
						exportVariableProcessor : function(queryModel,
								queryModelStructure, buffer) {
							var queryManager = queryModel.getQueryManager();
							var variablesList;
							var variables;
							var lenVariables;
							var variableIndex;
							var variableStructure;
							if (queryManager !== null) {
								if (queryManager.hasVariables()) {
									queryModelStructure.setBooleanByName(
											"Variable Processor Is Submitted",
											queryManager.isSubmitted());
									queryModelStructure
											.setBooleanByName(
													"Variable Processor Re-Init Supported",
													queryManager
															.supportsReInitVariables());
									if (queryManager
											.supportsDirectVariableTransfer()
											&& queryManager
													.isDirectVariableTransferEnabled()) {
										queryModelStructure
												.setBooleanByName(
														"Variable Processor Is Direct Variable Transfer Enabled",
														true);
									}
									sap.firefly.ReferenceQueryModel
											._exportVariables(queryManager
													.getVariableContainer(),
													queryModelStructure,
													"Variables", buffer);
									variablesList = queryModelStructure
											.setNewListByName("Variables");
									variables = sap.firefly.ReferenceQueryModel
											.getVariablesSorted(queryManager
													.getVariableContainer()
													.getVariables());
									if (variables !== null) {
										lenVariables = variables.size();
										for (variableIndex = 0; variableIndex < lenVariables; variableIndex++) {
											variableStructure = variablesList
													.addNewStructure();
											sap.firefly.ReferenceQueryModel
													.exportVariable(
															variables
																	.get(variableIndex),
															variableStructure,
															buffer);
										}
									}
								}
							}
						},
						exportExtendedDimensions : function(extendedDimensions,
								jsonStructure) {
							var extendedDimensionsList;
							var lenExtended;
							var i;
							if (!sap.firefly.XCollectionUtils
									.hasElements(extendedDimensions)) {
								return;
							}
							extendedDimensionsList = jsonStructure
									.setNewListByName("Extended Dimensions");
							lenExtended = extendedDimensions.size();
							for (i = 0; i < lenExtended; i++) {
								sap.firefly.ReferenceQueryModel
										.exportExtendedDimension(
												extendedDimensions.get(i),
												extendedDimensionsList);
							}
						},
						exportExtendedDimension : function(extendedDimension,
								jsonList) {
							var extendedDimensionStructure = jsonList
									.addNewStructure();
							var dataSource;
							var joinField;
							var joinFieldNameExternal;
							var joinParameters;
							var joinParametersList;
							var lenJoin;
							var i;
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									extendedDimensionStructure, "Join Type",
									extendedDimension.getJoinType());
							dataSource = extendedDimension.getDataSource();
							if (dataSource !== null) {
								extendedDimensionStructure.setStringByName(
										"Data Source", dataSource
												.getFullQualifiedName());
							}
							joinField = extendedDimension.getJoinField();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(joinField)) {
								extendedDimensionStructure.setStringByName(
										"Join Field", joinField);
							}
							joinFieldNameExternal = extendedDimension
									.getJoinFieldNameExternal();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(joinFieldNameExternal)) {
								extendedDimensionStructure.setStringByName(
										"Join Field Name External",
										joinFieldNameExternal);
							}
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									extendedDimensionStructure,
									"Dimension Type", extendedDimension
											.getDimensionType());
							joinParameters = extendedDimension
									.getJoinParameters();
							if (sap.firefly.XCollectionUtils
									.hasElements(joinParameters)) {
								joinParametersList = extendedDimensionStructure
										.setNewListByName("Join Parameters");
								lenJoin = joinParameters.size();
								for (i = 0; i < lenJoin; i++) {
									joinParametersList.addString(joinParameters
											.get(i));
								}
							}
						},
						exportExceptions : function(exceptionManager,
								jsonStructure) {
							var exceptionsList;
							var lenExceptions;
							var i;
							if (exceptionManager.isEmpty()) {
								return;
							}
							exceptionsList = jsonStructure
									.setNewListByName("Exceptions");
							lenExceptions = exceptionManager.size();
							for (i = 0; i < lenExceptions; i++) {
								sap.firefly.ReferenceQueryModel
										.exportException(exceptionManager
												.get(i), exceptionsList);
							}
						},
						exportExceptionsList : function(exceptions,
								jsonStructure) {
							var exceptionsList;
							var lenExceptions;
							var i;
							if (!sap.firefly.XCollectionUtils
									.hasElements(exceptions)) {
								return;
							}
							exceptionsList = jsonStructure
									.setNewListByName("Exceptions");
							lenExceptions = exceptions.size();
							for (i = 0; i < lenExceptions; i++) {
								sap.firefly.ReferenceQueryModel
										.exportException(exceptions.get(i),
												exceptionsList);
							}
						},
						exportException : function(exception, jsonList) {
							var exceptionStructure = jsonList.addNewStructure();
							var evaluates;
							var evaluatesList;
							var lenEval;
							var evaluateIndex;
							var evaluate;
							var measure;
							sap.firefly.ReferenceQueryModel.setBoolIfFalse(
									exceptionStructure, "Is Active", exception
											.isActive());
							sap.firefly.ReferenceQueryModel.setBoolIfFalse(
									exceptionStructure, "Is Changeable",
									exception.isChangeable());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									exceptionStructure,
									"Is Evaluated After Calculations",
									exception.isEvaluatedAfterCalculations());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									exceptionStructure, "Evaluate Default",
									exception.getEvaluateDefault());
							evaluates = exception.getEvaluates();
							evaluatesList = exceptionStructure
									.setNewListByName("Evaluates");
							lenEval = evaluates.size();
							for (evaluateIndex = 0; evaluateIndex < lenEval; evaluateIndex++) {
								evaluate = evaluates.get(evaluateIndex);
								evaluatesList.addString(evaluate.getName());
							}
							measure = exception.getMeasure();
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									exceptionStructure, "Measure", measure);
							exceptionStructure.setStringByName(
									"Exception Name", exception.getName());
							exceptionStructure.setStringByName(
									"Exception Text", exception.getText());
							sap.firefly.ReferenceQueryModel
									.exportExceptionThresholds(exception
											.getThresholds(),
											exceptionStructure);
						},
						exportExceptionThresholds : function(thresholds,
								jsonStructure) {
							var thresholdsList;
							var lenThreshold;
							var i;
							if (thresholds.isEmpty()) {
								return;
							}
							thresholdsList = jsonStructure
									.setNewListByName("Thresholds");
							lenThreshold = thresholds.size();
							for (i = 0; i < lenThreshold; i++) {
								sap.firefly.ReferenceQueryModel
										.exportExceptionThreshold(thresholds
												.get(i), thresholdsList);
							}
						},
						exportExceptionThreshold : function(threshold, jsonList) {
							var thresholdStructure = jsonList.addNewStructure();
							var highXValue;
							var lowValue;
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									thresholdStructure, "Alert Level",
									threshold.getAlertLevel());
							highXValue = threshold.getHighXValue();
							if (highXValue !== null) {
								if (highXValue.getValueType().isNumber()) {
									thresholdStructure.setDoubleByName(
											"Value High", threshold
													.getHighValue());
								} else {
									thresholdStructure.setStringByName("High",
											highXValue
													.getStringRepresentation());
								}
							}
							lowValue = threshold.getLowXValue();
							if (lowValue !== null) {
								if (lowValue.getValueType().isNumber()) {
									thresholdStructure.setDoubleByName(
											"Value Low", threshold
													.getLowValue());
								} else {
									thresholdStructure.setStringByName("Low",
											lowValue.getStringRepresentation());
								}
							}
							thresholdStructure.setStringByName(
									"Threshold Name", threshold.getName());
							thresholdStructure.setStringByName(
									"Threshold Text", threshold.getText());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									thresholdStructure, "Comparison Operator",
									threshold.getOperator());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									thresholdStructure, "Value Type", threshold
											.getValueType());
						},
						exportConditions : function(conditionManager,
								jsonStructure) {
							var conditionsList;
							var lenConditions;
							var i;
							if (!sap.firefly.XCollectionUtils
									.hasElements(conditionManager)) {
								return;
							}
							conditionsList = jsonStructure
									.setNewListByName("Conditions");
							lenConditions = conditionManager.size();
							for (i = 0; i < lenConditions; i++) {
								sap.firefly.ReferenceQueryModel
										.exportCondition(conditionManager
												.get(i), conditionsList);
							}
						},
						exportCondition : function(condition, jsonList) {
							var conditionStructure = jsonList.addNewStructure();
							var conditionName;
							var conditionDescription;
							sap.firefly.ReferenceQueryModel.setBoolIfFalse(
									conditionStructure, "Is Active", condition
											.isActive());
							sap.firefly.ReferenceQueryModel.setBoolIfFalse(
									conditionStructure, "Is Valid", condition
											.isValid());
							conditionName = condition.getConditionName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(conditionName)) {
								conditionStructure.setStringByName("Name",
										conditionName);
							}
							conditionDescription = condition.getDescription();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(conditionDescription)) {
								conditionStructure.setStringByName(
										"Description", conditionDescription);
							}
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									conditionStructure, "Evaluation Type",
									condition.getDimensionEvaluationType());
							sap.firefly.ReferenceQueryModel
									.exportEvaluationDimensions(condition
											.getEvaluationDimensions(),
											conditionStructure);
							sap.firefly.ReferenceQueryModel
									.exportConditionThresholds(condition
											.getThresholds(),
											conditionStructure);
						},
						exportConditionThresholds : function(thresholds,
								jsonStructure) {
							var thresholdsList;
							var lenThresholds;
							var i;
							if (thresholds.isEmpty()) {
								return;
							}
							thresholdsList = jsonStructure
									.setNewListByName("Thresholds");
							lenThresholds = thresholds.size();
							for (i = 0; i < lenThresholds; i++) {
								sap.firefly.ReferenceQueryModel
										.exportConditionThreshold(thresholds
												.get(i), thresholdsList);
							}
						},
						exportDimensionMember : function(dimensionMember,
								jsonList) {
							var memberStructure = jsonList.addNewStructure();
							var allFieldValues;
							var fieldValueKeys;
							var valuesList;
							var fieldValueKeysSorted;
							var len;
							var i;
							var valueStructure;
							var fieldValue;
							var value;
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									memberStructure, "Member Dimension",
									dimensionMember.getDimension());
							allFieldValues = dimensionMember
									.getAllFieldValues();
							if (allFieldValues.hasElements()) {
								fieldValueKeys = allFieldValues
										.getKeysAsReadOnlyListOfString();
								valuesList = memberStructure
										.setNewListByName("Values");
								fieldValueKeysSorted = sap.firefly.XListOfString
										.createFromReadOnlyList(fieldValueKeys);
								fieldValueKeysSorted
										.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
								len = fieldValueKeysSorted.size();
								for (i = 0; i < len; i++) {
									valueStructure = valuesList
											.addNewStructure();
									fieldValue = allFieldValues
											.getByKey(fieldValueKeysSorted
													.get(i));
									sap.firefly.ReferenceQueryModel
											.setNameIfNotNull(valueStructure,
													"Field", fieldValue
															.getField());
									value = fieldValue.getValue();
									if (value !== null) {
										valueStructure.setStringByName("Value",
												value.toString());
									}
								}
								fieldValueKeysSorted.releaseObject();
							}
						},
						exportConditionThreshold : function(threshold, jsonList) {
							var thresholdStructure = jsonList.addNewStructure();
							var measureCoordinates = threshold
									.getMeasureCoordinates();
							var measureCoordinatesList;
							var lenMeasures;
							var i;
							if (sap.firefly.XCollectionUtils
									.hasElements(measureCoordinates)) {
								measureCoordinatesList = thresholdStructure
										.setNewListByName("Measure Coordinate Members");
								lenMeasures = measureCoordinates.size();
								for (i = 0; i < lenMeasures; i++) {
									sap.firefly.ReferenceQueryModel
											.exportDimensionMember(
													measureCoordinates.get(i),
													measureCoordinatesList);
								}
							}
							sap.firefly.ReferenceQueryModel.setBoolIfFalse(
									thresholdStructure, "Is Valid", threshold
											.isValid());
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(threshold.getLow(),
											thresholdStructure, "Low");
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(threshold.getLowIs(),
											thresholdStructure, "Low Is");
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(threshold.getHigh(),
											thresholdStructure, "High");
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(
											threshold.getHighIs(),
											thresholdStructure, "High Is");
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									thresholdStructure, "Comparison Operator",
									threshold.getComparisonOperator());
						},
						exportEvaluationDimensions : function(
								evaluationDimensions, jsonStructure) {
							var evaluationDimensionsList;
							var len;
							var i;
							var evaluationDimension;
							if (evaluationDimensions.isEmpty()) {
								return;
							}
							evaluationDimensionsList = jsonStructure
									.setNewListByName("Evaluation Dimensions");
							len = evaluationDimensions.size();
							for (i = 0; i < len; i++) {
								evaluationDimension = evaluationDimensions
										.get(i);
								if (evaluationDimension !== null) {
									evaluationDimensionsList
											.addString(evaluationDimension
													.getName());
								}
							}
						},
						setIntegerIfNotNull : function(structure, name,
								intValue) {
							if (intValue !== null) {
								structure.setIntegerByName(name, intValue
										.getIntegerValue());
							}
						},
						exportFieldValue : function(fieldValue, fieldValuesList) {
							var fieldValueStructure = fieldValuesList
									.addNewStructure();
							var fieldStructure = sap.firefly.ReferenceQueryModel
									.exportField(fieldValue.getField());
							var valueStructure;
							if (fieldStructure !== null) {
								fieldValueStructure.setElementByName("Field",
										fieldStructure);
							}
							valueStructure = sap.firefly.ReferenceQueryModel
									.exportValue(fieldValue.getValue());
							if (valueStructure !== null) {
								fieldValueStructure.setElementByName("Value",
										valueStructure);
							}
						},
						exportValue : function(value) {
							var valueStructure;
							if (value === null) {
								return null;
							}
							valueStructure = sap.firefly.PrStructure.create();
							valueStructure.setStringByName("Value As String",
									value.toString());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									valueStructure, "Value Type", value
											.getValueType());
							return valueStructure;
						},
						getVariablesSorted : function(variables) {
							var variableNames;
							var lenVar;
							var i;
							var sorted;
							var j;
							if (variables === null) {
								return null;
							}
							variableNames = sap.firefly.XListOfString.create();
							lenVar = variables.size();
							for (i = 0; i < lenVar; i++) {
								variableNames.add(variables.get(i).getName());
							}
							variableNames
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							sorted = sap.firefly.XList.create();
							for (j = 0; j < lenVar; j++) {
								sorted.add(variables.getByKey(variableNames
										.get(j)));
							}
							variableNames.releaseObject();
							return sorted;
						},
						getAttributesSorted : function(attributes) {
							var attributeNames = sap.firefly.XListOfString
									.create();
							var lenAttributes = attributes.size();
							var i;
							var sorted;
							var j;
							for (i = 0; i < lenAttributes; i++) {
								attributeNames.add(attributes.get(i).getName());
							}
							attributeNames
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							sorted = sap.firefly.XList.create();
							for (j = 0; j < lenAttributes; j++) {
								sorted.add(attributes.getByKey(attributeNames
										.get(j)));
							}
							attributeNames.releaseObject();
							return sorted;
						},
						getFieldsSorted : function(fields) {
							var fieldNames = sap.firefly.XListOfString.create();
							var lenFields = fields.size();
							var i;
							var sorted;
							var j;
							for (i = 0; i < lenFields; i++) {
								fieldNames.add(fields.get(i).getName());
							}
							fieldNames
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							sorted = sap.firefly.XList.create();
							for (j = 0; j < lenFields; j++) {
								sorted.add(fields.getByKey(fieldNames.get(j)));
							}
							fieldNames.releaseObject();
							return sorted;
						},
						getDimensionsSorted : function(dimensions) {
							var dimensionNames = sap.firefly.XListOfString
									.create();
							var lenDimensions = dimensions.size();
							var i;
							var sorted;
							var j;
							for (i = 0; i < lenDimensions; i++) {
								dimensionNames.add(dimensions.get(i).getName());
							}
							dimensionNames
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							sorted = sap.firefly.XList.create();
							for (j = 0; j < lenDimensions; j++) {
								sorted.add(dimensions.getByKey(dimensionNames
										.get(j)));
							}
							dimensionNames.releaseObject();
							return sorted;
						},
						exportDataCellList : function(dataCells, jsonStructure) {
							var dataCellList = jsonStructure
									.setNewListByName("Query Data Cells");
							var lenDataCells = dataCells.size();
							var dataCellIndex;
							for (dataCellIndex = 0; dataCellIndex < lenDataCells; dataCellIndex++) {
								sap.firefly.ReferenceQueryModel.exportDataCell(
										dataCells.get(dataCellIndex),
										dataCellList.addNewStructure());
							}
						},
						exportDataCell : function(dataCell, jsonStructure) {
							var dataCellStructure = jsonStructure
									.setNewStructureByName(dataCell.getName());
							if (dataCell.supportsBaseValueType()) {
								sap.firefly.ReferenceQueryModel
										.setNameIfNotNull(dataCellStructure,
												"Base Value Type", dataCell
														.getBaseValueType());
							}
							dataCellStructure.setIntegerByName(
									"Decimal Places", dataCell
											.getDecimalPlaces());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									dataCellStructure, "Dimension Reference",
									dataCell.getDimensionReference());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									dataCellStructure, "Disaggregation Mode",
									dataCell.getDisaggregationMode());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									dataCellStructure,
									"Disaggregation Ref Cell", dataCell
											.getDisaggregationRefCell());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									dataCellStructure,
									"Reference Structure Element 1", dataCell
											.getReferenceStructureElement1());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									dataCellStructure,
									"Reference Structure Element 2", dataCell
											.getReferenceStructureElement2());
							dataCellStructure.setIntegerByName(
									"Scaling Factor", dataCell
											.getScalingFactor());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									dataCellStructure, "Has Sign Reversal",
									dataCell.hasSignReversal());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									dataCellStructure, "Is Cumulated", dataCell
											.isCumulated());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									dataCellStructure, "Is Emphasized",
									dataCell.isEmphasized());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									dataCellStructure, "Is Input Enabled",
									dataCell.isInputEnabled());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									dataCellStructure,
									"Supports Base Value Type", dataCell
											.supportsBaseValueType());
						},
						exportDimensionHierarchies : function(dimension,
								jsonStructure) {
							var hierarchies;
							var hierarchiesList;
							var lenHiers;
							var i;
							var hierarchy;
							var hierarchyStructure;
							var hierarchyType;
							if (dimension.supportsHierarchyMetadata() === false) {
								return;
							}
							jsonStructure.setBooleanByName(
									"Hierarchy Possible", dimension
											.supportsHierarchy());
							hierarchies = sap.firefly.HierarchyCatalogUtil
									.getHierarchyItems(dimension
											.getHierarchies());
							if (sap.firefly.XCollectionUtils
									.hasElements(hierarchies)) {
								hierarchiesList = jsonStructure
										.setNewListByName("Hierarchies");
								lenHiers = hierarchies.size();
								for (i = 0; i < lenHiers; i++) {
									hierarchy = hierarchies.get(i);
									hierarchyStructure = hierarchiesList
											.addNewStructure();
									hierarchyStructure.setStringByName(
											"Hierarchy Name", hierarchy
													.getHierarchyName());
									hierarchyStructure.setStringByName(
											"Hierarchy Description", hierarchy
													.getHierarchyDescription());
									if (hierarchy.hasVersionName()) {
										hierarchyStructure.setStringByName(
												"Version Name", hierarchy
														.getVersionName());
									}
									if (hierarchy.hasVersionDescription()) {
										hierarchyStructure
												.setStringByName(
														"Version Description",
														hierarchy
																.getVersionDescription());
									}
									if (hierarchy.getDateTo() !== null) {
										hierarchyStructure.setStringByName(
												"Date To", hierarchy
														.getDateTo()
														.toIsoFormat());
									}
									if (hierarchy.getDateFrom() !== null) {
										hierarchyStructure.setStringByName(
												"Date From", hierarchy
														.getDateFrom()
														.toIsoFormat());
									}
									if (hierarchy.hasHierId()) {
										hierarchyStructure.setStringByName(
												"Hier ID", hierarchy
														.getHierId());
									}
									if (hierarchy.hasObjectVersion()) {
										hierarchyStructure.setStringByName(
												"Object Version", hierarchy
														.getObjectVersion());
									}
									if (hierarchy.hasOwner()) {
										hierarchyStructure.setStringByName(
												"Owner", hierarchy.getOwner());
									}
									hierarchyType = hierarchy
											.getHierarchyType();
									if ((hierarchyType !== null)
											&& (hierarchyType !== sap.firefly.HierarchyType.UNKNOWN)) {
										hierarchyStructure.setStringByName(
												"Hierarchy Type", hierarchyType
														.getName());
										sap.firefly.ReferenceQueryModel
												.setBoolIfTrue(
														hierarchyStructure,
														"Hierarchy Type Leveled",
														hierarchyType
																.isLeveledHierarchy());
									}
									sap.firefly.ReferenceQueryModel
											.exportHierarchyLevels(hierarchy,
													hierarchyStructure);
								}
							}
						},
						exportHierarchyLevels : function(hierarchy,
								jsonStructure) {
							var hierarchyLevels;
							var hierarchyLevelList;
							var lenHierLevel;
							var i;
							var hierarchyLevel;
							var hierarchyLevelStructure;
							if ((hierarchy === null)
									|| (!hierarchy.supportsHierarchyLevels())) {
								return;
							}
							hierarchyLevels = hierarchy.getHierarchyLevels();
							if (!sap.firefly.XCollectionUtils
									.hasElements(hierarchyLevels)) {
								return;
							}
							hierarchyLevelList = jsonStructure
									.setNewListByName("Hierarchy Levels");
							lenHierLevel = hierarchyLevels.size();
							for (i = 0; i < lenHierLevel; i++) {
								hierarchyLevel = hierarchyLevels.get(i);
								hierarchyLevelStructure = hierarchyLevelList
										.addNewStructure();
								hierarchyLevelStructure.setIntegerByName(
										"Level", hierarchyLevel.getLevel());
								hierarchyLevelStructure.setStringByName("Name",
										hierarchyLevel.getLevelName());
								hierarchyLevelStructure.setStringByName(
										"Description", hierarchyLevel
												.getLevelDescription());
								hierarchyLevelStructure.setStringByName(
										"Unique Name", hierarchyLevel
												.getLevelUniqueName());
								hierarchyLevelStructure.setStringByName(
										"Dimension Name", hierarchyLevel
												.getLevelDimensionName());
							}
						},
						isFlatTextField : function(field) {
							var dimension = field.getDimension();
							if (dimension === null) {
								return false;
							}
							return field === dimension.getFlatTextField();
						},
						isFlatKeyField : function(field) {
							var dimension = field.getDimension();
							if (dimension === null) {
								return false;
							}
							return field === dimension.getFlatKeyField();
						},
						isHierarchyKeyField : function(field) {
							var dimension = field.getDimension();
							if (dimension === null) {
								return false;
							}
							return field === dimension.getHierarchyKeyField();
						},
						isHierarchyTextField : function(field) {
							var dimension = field.getDimension();
							if (dimension === null) {
								return false;
							}
							return field === dimension.getHierarchyTextField();
						},
						exportField : function(field) {
							var fieldStructure;
							var aliasName;
							var conversionRoutine;
							var decimals;
							var dependencyFields;
							var dependencyFieldsList;
							var lenDependencyField;
							var dependencyFieldIndex;
							var initialValue;
							var length;
							var lowerBound;
							var upperBound;
							var precision;
							var fieldSortingStructure;
							if (field === null) {
								return null;
							}
							fieldStructure = sap.firefly.PrStructure.create();
							fieldStructure.setStringByName("Field", field
									.getName());
							fieldStructure.setStringByName("Text", field
									.getText());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Is Key Field Flat",
									sap.firefly.ReferenceQueryModel
											.isFlatKeyField(field));
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Is Text Field Flat",
									sap.firefly.ReferenceQueryModel
											.isFlatTextField(field));
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Is Key Field Hierarchy",
									sap.firefly.ReferenceQueryModel
											.isHierarchyKeyField(field));
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Is Text Field Hierarchy",
									sap.firefly.ReferenceQueryModel
											.isHierarchyTextField(field));
							sap.firefly.ReferenceQueryModel.setConstantByName(
									fieldStructure, "Presentation Type", field
											.getPresentationType());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Key", field.isKeyField());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Default Text", field
											.isDefaultTextField());
							fieldStructure.setBooleanByName("Selectable", field
									.isFilterable());
							sap.firefly.ReferenceQueryModel.setConstantByName(
									fieldStructure, "Value Type", field
											.getValueType());
							aliasName = field.getAliasName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(aliasName)) {
								fieldStructure.setStringByName("Alias Name",
										aliasName);
							}
							conversionRoutine = field.getConversionRoutine();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(conversionRoutine)) {
								fieldStructure
										.setStringByName("Conversion Routine",
												conversionRoutine);
							}
							decimals = field.getDecimals();
							if (decimals !== 0) {
								fieldStructure.setIntegerByName("Decimals",
										decimals);
							}
							dependencyFields = field.getDependencyFields();
							if (sap.firefly.XCollectionUtils
									.hasElements(dependencyFields)) {
								dependencyFieldsList = fieldStructure
										.setNewListByName("Dependency Fields");
								lenDependencyField = dependencyFields.size();
								for (dependencyFieldIndex = 0; dependencyFieldIndex < lenDependencyField; dependencyFieldIndex++) {
									dependencyFieldsList
											.addString(dependencyFields
													.get(dependencyFieldIndex));
								}
							}
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									fieldStructure, "Info Object Type", field
											.getInfoObjectType());
							initialValue = field.getInitialValue();
							if (sap.firefly.XStringUtils
									.isNullOrEmpty(initialValue)) {
								fieldStructure.setStringByName("Initial Value",
										initialValue);
							}
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Is Lowercase Enabled",
									field.getIsLowerCaseEnabled());
							length = field.getLength();
							if (length !== 0) {
								fieldStructure.setIntegerByName("Length",
										length);
							}
							lowerBound = field.getLowerBound();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(lowerBound)) {
								fieldStructure.setStringByName("Bound Lower",
										lowerBound);
							}
							upperBound = field.getUpperBound();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(upperBound)) {
								fieldStructure.setStringByName("Bound Upper",
										upperBound);
							}
							precision = field.getPrecision();
							if (precision !== 0) {
								fieldStructure.setIntegerByName("Precision",
										precision);
							}
							if (field.hasSorting()) {
								fieldSortingStructure = sap.firefly.ReferenceQueryModel
										.exportSorting(field
												.getResultSetSorting());
								if (fieldSortingStructure !== null) {
									fieldStructure.setElementByName(
											"Result Set Sorting",
											fieldSortingStructure);
								}
							}
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									fieldStructure, "Text Transformation Type",
									field.getTextTransformation());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									fieldStructure, "Field Usage Type", field
											.getUsageType());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									fieldStructure, "Visibility Type", field
											.getVisibilityType());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Is Always Requested",
									field.isAlwaysRequested());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									fieldStructure, "Is Hierarchy Path Field",
									field.isHierarchyPathField());
							return fieldStructure;
						},
						exportSorting : function(sorting) {
							var sortingStructure;
							if (sorting === null) {
								return null;
							}
							sortingStructure = sap.firefly.PrStructure.create();
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									sortingStructure, "Sort Direction", sorting
											.getDirection());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									sortingStructure, "Sort Type", sorting
											.getSortingType());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									sortingStructure,
									"Is Break Grouping Enabled", sorting
											.isBreakGroupingEnabled());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									sortingStructure,
									"Is Preserve Grouping Enabled", sorting
											.isPreserveGroupingEnabled());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									sortingStructure,
									"Supports Break Grouping", sorting
											.supportsBreakGrouping());
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									sortingStructure,
									"Supports Preserve Grouping", sorting
											.supportsPreserveGrouping());
							return sortingStructure;
						},
						exportAxis : function(axis, jsonList, axisName, buffer) {
							var dimensions = axis.getDimensions();
							var axisStructure;
							var lenDim;
							var i;
							var dimension;
							if (!sap.firefly.XCollectionUtils
									.hasElements(dimensions)
									&& (!axis.isHierarchyActive())) {
								return;
							}
							axisStructure = jsonList.addNewStructure();
							axisStructure
									.setStringByName("Axis Name", axisName);
							if (dimensions !== null) {
								buffer.clear();
								lenDim = dimensions.size();
								for (i = 0; i < lenDim; i++) {
									dimension = dimensions.get(i);
									if (dimension === null) {
										continue;
									}
									if (buffer.length() > 0) {
										buffer.append("|");
									}
									buffer.append(dimension.getName());
								}
								if (buffer.length() > 0) {
									axisStructure.setStringByName("Dimensions",
											buffer.toString());
								}
							}
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									axisStructure, "Hierarchy Active", axis
											.isHierarchyActive());
						},
						exportSelector : function(selector, jsonStructure, name) {
							var referenceQueryModel = new sap.firefly.ReferenceQueryModel();
							referenceQueryModel._exportSelector(selector,
									jsonStructure, name,
									sap.firefly.XStringBuffer.create());
						},
						exportSelectionPrimitiveOperation : function(
								primitiveOperation, jsonStructure) {
							var hierarchyName;
							sap.firefly.ReferenceQueryModel
									.exportSelectionCoreOperator(
											primitiveOperation, jsonStructure);
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									jsonStructure, "Operand Type Field",
									primitiveOperation.getField());
							hierarchyName = primitiveOperation
									.getHierarchyName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(hierarchyName)) {
								jsonStructure
										.setStringByName(
												"Operand Type Hierarchy",
												hierarchyName);
							}
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									jsonStructure, "Convert To Flat Selection",
									primitiveOperation
											.isConvertToFlatSelection());
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(primitiveOperation
											.getLow(), jsonStructure, "Low");
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(primitiveOperation
											.getHigh(), jsonStructure, "High");
							if ((primitiveOperation.getThird() !== null)
									&& (primitiveOperation.getThird()
											.getValue() !== null)) {
								sap.firefly.ReferenceQueryModel
										.exportSelectionValue(
												primitiveOperation.getThird(),
												jsonStructure, "Third");
							}
						},
						exportSelectionCartesianProduct : function(
								cartesianProduct, jsonStructure) {
							var jsonList = jsonStructure
									.setNewListByName("Selection Signed Sets");
							var lenCartesianProduct = cartesianProduct.size();
							var i;
							for (i = 0; i < lenCartesianProduct; i++) {
								sap.firefly.ReferenceQueryModel
										.exportSelectionSignedSet(
												cartesianProduct
														.getCartesianChild(i),
												jsonList.addNewStructure());
							}
						},
						exportSelectionSignedSet : function(signedSet,
								jsonStructure) {
							var hierarchyName;
							var jsonList;
							var lenSignedSet;
							var i;
							sap.firefly.ReferenceQueryModel.setNameOrNull(
									jsonStructure, "Dimension", signedSet
											.getDimension());
							sap.firefly.ReferenceQueryModel.setNameOrNull(
									jsonStructure, "Field", signedSet
											.getField());
							hierarchyName = signedSet.getHierarchyName();
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(hierarchyName)) {
								jsonStructure.setStringByName("Hierarchy",
										hierarchyName);
							}
							sap.firefly.ReferenceQueryModel.setBoolIfTrue(
									jsonStructure, "Convert To Flat Selection",
									signedSet.isConvertToFlatSelection());
							jsonList = jsonStructure
									.setNewListByName("Elements");
							lenSignedSet = signedSet.size();
							for (i = 0; i < lenSignedSet; i++) {
								sap.firefly.ReferenceQueryModel
										.exportSelectionSignedSetElement(
												signedSet.getOp(i), jsonList
														.addNewStructure());
							}
						},
						exportSelectionSignedSetElement : function(
								signedSetElement, jsonStructure) {
							var firstValue;
							var secondValue;
							var thirdValue;
							sap.firefly.ReferenceQueryModel
									.exportSelectionSignedSetOperator(
											signedSetElement, jsonStructure);
							firstValue = signedSetElement.getLow();
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(firstValue,
											jsonStructure, "Value #1");
							secondValue = signedSetElement.getHigh();
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(secondValue,
											jsonStructure, "Value #2");
							thirdValue = signedSetElement.getThird();
							if ((thirdValue !== null)
									&& (thirdValue.getValue() !== null)) {
								sap.firefly.ReferenceQueryModel
										.exportSelectionValue(thirdValue,
												jsonStructure, "Value #3");
							}
						},
						exportSelectionValue : function(selectionValue,
								parentStructure, name) {
							var filterValue;
							var jsonStructure;
							var value;
							var valueType;
							var stringValue;
							var memberNavigations;
							var memberNavigationsList;
							var lenMemberNavigation;
							var j;
							var memberNavigation;
							if (selectionValue === null) {
								return;
							}
							filterValue = selectionValue.getFilterValue();
							if (selectionValue
									.getOlapComponentType()
									.isTypeOf(
											sap.firefly.OlapComponentType.FILTER_LITERAL)) {
								if (sap.firefly.XStringUtils
										.isNullOrEmpty(filterValue)) {
									return;
								}
							}
							jsonStructure = parentStructure
									.setNewStructureByName(name);
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(filterValue)) {
								jsonStructure.setStringByName("Filter Value",
										filterValue);
								jsonStructure.setBooleanByName(
										"Star Wildcard Supported",
										selectionValue.supportsStarWildcard());
								jsonStructure.setBooleanByName(
										"Star Wildcard Enabled", selectionValue
												.isStarWildcardEnabled());
							}
							if (selectionValue
									.getOlapComponentType()
									.isTypeOf(
											sap.firefly.OlapComponentType.FILTER_LITERAL)) {
								return;
							}
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									jsonStructure, "Field", selectionValue
											.getField());
							jsonStructure.setStringByName(
									"Field Formatted Value", selectionValue
											.getFormattedValue());
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									jsonStructure, "Dimension", selectionValue
											.getDimension());
							value = selectionValue.getValue();
							if (value !== null) {
								valueType = value.getValueType();
								if (valueType !== null) {
									jsonStructure.setStringByName("Value Type",
											valueType.toString());
								}
								if (valueType === sap.firefly.XValueType.VARIABLE) {
									sap.firefly.ReferenceQueryModel
											.setNameIfNotNull(jsonStructure,
													"Variable", (value)
															.getVariable());
								} else {
									stringValue = sap.firefly.ReferenceQueryModel
											.valueToString(value);
									if (stringValue !== null) {
										jsonStructure.setStringByName("Value",
												stringValue);
									}
								}
							}
							memberNavigations = selectionValue
									.getMemberNavigations();
							if (sap.firefly.XCollectionUtils
									.hasElements(memberNavigations)) {
								memberNavigationsList = jsonStructure
										.setNewListByName("Navigations");
								lenMemberNavigation = memberNavigations.size();
								for (j = 0; j < lenMemberNavigation; j++) {
									memberNavigation = memberNavigations.get(j);
									memberNavigationsList
											.addString(memberNavigation
													.getMemberFunction()
													.getName());
								}
							}
						},
						valueToString : function(value) {
							if (value === null) {
								return null;
							}
							return value.getStringRepresentation();
						},
						exportSelectionSignedSetOperator : function(
								signedSetOperator, jsonStructure) {
							sap.firefly.ReferenceQueryModel
									.exportSelectionCoreOperator(
											signedSetOperator, jsonStructure);
							sap.firefly.ReferenceQueryModel.setConstantByName(
									jsonStructure, "Set Sign",
									signedSetOperator.getSetSign());
							if (signedSetOperator.hasDepth()) {
								jsonStructure.setIntegerByName("Depth",
										signedSetOperator.getDepth());
							}
							if (signedSetOperator.hasLevelOffset()) {
								jsonStructure.setIntegerByName("Level Offset",
										signedSetOperator.getLevelOffset());
							}
						},
						exportSelectionCoreOperator : function(coreOperator,
								jsonStructure) {
							var comparisonOperator = coreOperator
									.getComparisonOperator();
							sap.firefly.ReferenceQueryModel.setConstantByName(
									jsonStructure, "Comparison Operator",
									comparisonOperator);
							if (comparisonOperator === sap.firefly.ComparisonOperator.SEARCH) {
								coreOperator.getExactness();
							}
							if (coreOperator.hasDepth()) {
								jsonStructure.setIntegerByName("Depth",
										coreOperator.getDepth());
							}
							if (coreOperator.hasLevelOffset()) {
								jsonStructure.setIntegerByName("Level Offset",
										coreOperator.getLevelOffset());
							}
							sap.firefly.ReferenceQueryModel.setNameIfNotNull(
									jsonStructure, "Set Sign", coreOperator
											.getSetSign());
						},
						exportVariables : function(variableContext,
								jsonStructure, name) {
							sap.firefly.ReferenceQueryModel._exportVariables(
									variableContext, jsonStructure, name,
									sap.firefly.XStringBuffer.create());
						},
						_exportVariables : function(variableContext,
								jsonStructure, name, buffer) {
							var variableList;
							var variables;
							var lenVars;
							var i;
							var variableStructure;
							if (variableContext === null) {
								return;
							}
							variableList = jsonStructure.setNewListByName(name);
							variables = sap.firefly.ReferenceQueryModel
									.getVariablesSorted(variableContext
											.getVariables());
							if (variables !== null) {
								lenVars = variables.size();
								for (i = 0; i < lenVars; i++) {
									variableStructure = variableList
											.addNewStructure();
									sap.firefly.ReferenceQueryModel
											.exportVariable(variables.get(i),
													variableStructure, buffer);
								}
							}
						},
						exportVariableNames : function(variables, name,
								separator, jsonStructure, buffer) {
							var lenVars;
							var i;
							var variable;
							var variableName;
							buffer.clear();
							if (variables === null) {
								return;
							}
							lenVars = variables.size();
							for (i = 0; i < lenVars; i++) {
								variable = variables.get(i);
								if (variable === null) {
									continue;
								}
								variableName = variable.getName();
								if (sap.firefly.XStringUtils
										.isNullOrEmpty(variableName)) {
									continue;
								}
								if (buffer.length() > 0) {
									buffer.append(separator);
								}
								buffer.append(variableName);
							}
							if (buffer.length() > 0) {
								jsonStructure.setStringByName(name, buffer
										.toString());
							}
						},
						exportVariable : function(variable, jsonStructure,
								buffer) {
							var variableType;
							jsonStructure.setStringByName("Name", variable
									.getName());
							jsonStructure.setStringByName("Text", variable
									.getText());
							jsonStructure.setBooleanByName("Input Enabled",
									variable.isInputEnabled());
							jsonStructure.setBooleanByName("Mandatory",
									variable.isMandatory());
							jsonStructure.setBooleanByName(
									"Initial Value Allowed", variable
											.isInitialValueAllowed());
							sap.firefly.ReferenceQueryModel
									.exportVariableNames(variable
											.getAffectedVariables(),
											"Affected Variables", ",",
											jsonStructure, buffer);
							sap.firefly.ReferenceQueryModel
									.exportVariableNames(variable
											.getDependentVariables(),
											"Dependent Variables", ",",
											jsonStructure, buffer);
							sap.firefly.ReferenceQueryModel.setConstantByName(
									jsonStructure, "Value Type", variable
											.getValueType());
							variableType = variable.getVariableType();
							if (variableType === null) {
								jsonStructure.setNullByName("Variable Type");
							} else {
								jsonStructure.setStringByName("Variable Type",
										variableType.toString());
								if (variableType === sap.firefly.VariableType.TEXT_VARIABLE) {
									sap.firefly.ReferenceQueryModel
											.exportTextVariable(variable,
													jsonStructure);
								} else {
									if (variableType === sap.firefly.VariableType.FORMULA_VARIABLE) {
										sap.firefly.ReferenceQueryModel
												.exportFormulaVariable(
														variable, jsonStructure);
									} else {
										if (variableType === sap.firefly.VariableType.SIMPLE_TYPE_VARIABLE) {
											sap.firefly.ReferenceQueryModel
													.exportSimpleTypeVariable(
															variable,
															jsonStructure);
										} else {
											if (variableType === sap.firefly.VariableType.HIERARCHY_NODE_VARIABLE) {
												sap.firefly.ReferenceQueryModel
														.exportHierarchyNodeVariable(
																variable,
																jsonStructure);
											} else {
												if (variableType === sap.firefly.VariableType.HIERARCHY_NAME_VARIABLE) {
													sap.firefly.ReferenceQueryModel
															.exportHierarchyNameVariable(
																	variable,
																	jsonStructure);
												} else {
													if (variableType === sap.firefly.VariableType.DIMENSION_MEMBER_VARIABLE) {
														sap.firefly.ReferenceQueryModel
																.exportDimensionMemberVariable(
																		variable,
																		jsonStructure);
													} else {
														if (variableType === sap.firefly.VariableType.HIERARCHY_VARIABLE) {
															sap.firefly.ReferenceQueryModel
																	.exportHierarchyVariable(
																			variable,
																			jsonStructure);
														} else {
															if (variableType === sap.firefly.VariableType.OPTION_LIST_VARIABLE) {
																sap.firefly.ReferenceQueryModel
																		.exportOptionListVariable(
																				variable,
																				jsonStructure);
															} else {
																throw sap.firefly.XException
																		.createIllegalStateException("Illegal variable type");
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
						exportHierarchyVariable : function(hierarchyVariable,
								jsonStructure) {
							sap.firefly.ReferenceQueryModel
									.exportOptionListVariable(
											hierarchyVariable, jsonStructure);
						},
						exportOptionListVariable : function(optionListVariable,
								jsonStructure) {
							var options = optionListVariable.getOptions();
							var optionsList;
							var lenOptions;
							var i;
							var optionStructure;
							var option;
							var currentOption;
							var currentOptionStructure;
							if (options !== null) {
								optionsList = jsonStructure
										.setNewListByName("Options");
								lenOptions = options.size();
								for (i = 0; i < lenOptions; i++) {
									optionStructure = optionsList
											.addNewStructure();
									option = options.get(i);
									optionStructure.setStringByName("Name",
											option.getName());
									optionStructure.setStringByName("Text",
											option.getText());
								}
							}
							currentOption = optionListVariable
									.getCurrentOption();
							if (currentOption !== null) {
								currentOptionStructure = jsonStructure
										.setNewStructureByName("Current Option");
								currentOptionStructure.setStringByName("Name",
										currentOption.getName());
								currentOptionStructure.setStringByName("Text",
										currentOption.getText());
							}
						},
						exportHierarchyNodeVariable : function(
								hierarchyNodeVariable, jsonStructure) {
							sap.firefly.ReferenceQueryModel
									.exportDimensionMemberVariable(
											hierarchyNodeVariable,
											jsonStructure);
						},
						exportHierarchyNameVariable : function(
								hierarchyNameVariable, jsonStructure) {
							var hierarchyNameDimension;
							sap.firefly.ReferenceQueryModel
									.exportDimensionMemberVariable(
											hierarchyNameVariable,
											jsonStructure);
							hierarchyNameDimension = hierarchyNameVariable
									.getHierarchyNameDimension();
							sap.firefly.ReferenceQueryModel.setNameOrNull(
									jsonStructure, "Hierarchy Name Dimension",
									hierarchyNameDimension);
						},
						exportDimensionMemberVariable : function(
								dimensionMemberVariable, jsonStructure) {
							var memberSelection = dimensionMemberVariable
									.getMemberSelection();
							var desinedSelectionCapability;
							var selectionCapabilities;
							if (memberSelection !== null) {
								sap.firefly.ReferenceQueryModel
										.exportSelectionSignedSet(
												memberSelection,
												jsonStructure
														.setNewStructureByName("Member Selection Signed Set"));
							}
							desinedSelectionCapability = dimensionMemberVariable
									.getSelectionCapability();
							if (desinedSelectionCapability !== null) {
								sap.firefly.ReferenceQueryModel
										.exportSelectionCapability(
												desinedSelectionCapability,
												jsonStructure
														.setNewStructureByName("Selection Capability Designed"));
							}
							selectionCapabilities = dimensionMemberVariable
									.getSelectionCapabilities();
							if (selectionCapabilities !== null) {
								sap.firefly.ReferenceQueryModel
										.exportSelectionCapabilities(
												selectionCapabilities,
												jsonStructure
														.setNewStructureByName("Selection Capabilities"));
							}
						},
						exportSelectionCapabilities : function(capabilityList,
								jsonStructure) {
							var selectableFields;
							var jsonList;
							var lenSelectableFields;
							var i;
							var fieldStructure;
							var selectableField;
							var capability;
							jsonStructure.setBooleanByName(
									"Multiple Values Supported", capabilityList
											.supportsMultipleValues());
							selectableFields = sap.firefly.ReferenceQueryModel
									.getFieldsSorted(capabilityList
											.getSelectableFields());
							if (selectableFields === null) {
								return;
							}
							jsonList = jsonStructure
									.setNewListByName("Field Capabilities");
							lenSelectableFields = selectableFields.size();
							for (i = 0; i < lenSelectableFields; i++) {
								fieldStructure = jsonList.addNewStructure();
								selectableField = selectableFields.get(i);
								fieldStructure.setStringByName("Field",
										selectableField.getName());
								capability = capabilityList
										.getSelectionCapabilitiesByField(selectableField);
								if (capability !== null) {
									sap.firefly.ReferenceQueryModel
											.exportSelectionCapability(
													capability,
													fieldStructure
															.setNewStructureByName("Capability"));
								}
							}
						},
						exportSelectionCapability : function(capability,
								jsonStructure) {
							var supportedSetSign;
							var lenSupportedSign;
							var i;
							var setSign;
							var operatorsList;
							var supportedComparisonOperators;
							var sortedOperators;
							var lenSupportedOperators;
							var j;
							var k;
							jsonStructure.setBooleanByName(
									"Selection Capability Group", capability
											.isSelectionCapabilityGroup());
							supportedSetSign = capability.getSupportedSetSign();
							if (supportedSetSign !== null) {
								lenSupportedSign = supportedSetSign.size();
								for (i = 0; i < lenSupportedSign; i++) {
									setSign = supportedSetSign.get(i);
									operatorsList = jsonStructure
											.setNewListByName(sap.firefly.XString
													.concatenate2(
															"Supported Set Sign Comparison Operators ",
															setSign.toString()));
									supportedComparisonOperators = capability
											.getSupportedComparisonOperators(setSign);
									if (supportedComparisonOperators !== null) {
										sortedOperators = sap.firefly.XListOfString
												.create();
										lenSupportedOperators = supportedComparisonOperators
												.size();
										for (j = 0; j < lenSupportedOperators; j++) {
											sortedOperators
													.add(supportedComparisonOperators
															.get(j).toString());
										}
										sortedOperators
												.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
										for (k = 0; k < lenSupportedOperators; k++) {
											operatorsList
													.addString(sortedOperators
															.get(k));
										}
										sortedOperators.releaseObject();
									}
								}
							}
						},
						exportFormulaVariable : function(formulaVariable,
								jsonStructure) {
							sap.firefly.ReferenceQueryModel
									.exportSimpleTypeVariable(formulaVariable,
											jsonStructure);
							jsonStructure.setDoubleByName("Forumlua Value",
									formulaVariable.getFormulaValue());
						},
						exportTextVariable : function(textVariable,
								jsonStructure) {
							sap.firefly.ReferenceQueryModel
									.exportSimpleTypeVariable(textVariable,
											jsonStructure);
							jsonStructure.setStringByName("Text Value",
									textVariable.getTextValue());
						},
						exportSimpleTypeVariable : function(simpleTypeVariable,
								jsonStructure) {
							var valueType;
							var date;
							var dateTime;
							jsonStructure.setBooleanByName("Has Value",
									simpleTypeVariable.hasValue());
							valueType = simpleTypeVariable.getValueType();
							if (valueType === sap.firefly.XValueType.STRING) {
								jsonStructure.setStringByName("String Value",
										simpleTypeVariable.getStringValue());
							} else {
								if (valueType === sap.firefly.XValueType.INTEGER) {
									jsonStructure.setIntegerByName(
											"Integer Value", simpleTypeVariable
													.getIntegerValue());
								} else {
									if (valueType === sap.firefly.XValueType.DOUBLE) {
										jsonStructure.setDoubleByName(
												"Double Value",
												simpleTypeVariable
														.getDoubleValue());
									} else {
										if (valueType === sap.firefly.XValueType.LONG) {
											jsonStructure.setDoubleByName(
													"Long Value",
													simpleTypeVariable
															.getLongValue());
										} else {
											if (valueType === sap.firefly.XValueType.DATE) {
												date = simpleTypeVariable
														.getDateValue();
												if (date === null) {
													jsonStructure
															.setNullByName("Date Value");
												} else {
													jsonStructure
															.setStringByName(
																	"Date Value",
																	date
																			.toIsoFormat());
												}
											} else {
												if (valueType === sap.firefly.XValueType.DATE_TIME) {
													dateTime = simpleTypeVariable
															.getDateTimeValue();
													if (dateTime === null) {
														jsonStructure
																.setNullByName("DateTime Value");
													} else {
														jsonStructure
																.setStringByName(
																		"DateTime Value",
																		dateTime
																				.toIsoFormat());
													}
												} else {
													throw sap.firefly.XException
															.createIllegalStateException("Illegal value type");
												}
											}
										}
									}
								}
							}
						}
					},
					m_queryModel : null,
					m_ignoreStructureMemberOrder : false,
					setup : function(queryModel) {
						this.m_queryModel = sap.firefly.XWeakReferenceUtil
								.getWeakRef(queryModel);
					},
					exportToAscii : function() {
						return sap.firefly.PrToString.serialize(this
								.exportToJson(), true, true, 4);
					},
					exportToJson : function() {
						var jsonStructure = sap.firefly.PrStructure.create();
						var queryModel = sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_queryModel);
						this.exportQueryModel(queryModel, jsonStructure);
						return jsonStructure;
					},
					exportQueryModel : function(queryModel, jsonStructure) {
						var queryModelStructure;
						var buffer;
						var axesList;
						if (queryModel === null) {
							return;
						}
						queryModelStructure = jsonStructure
								.setNewStructureByName("Query Model");
						sap.firefly.ReferenceQueryModel.exportDataSource(
								queryModel, queryModelStructure);
						this.exportInfoProvider("Info Provider", queryModel
								.getInfoProvider(), queryModelStructure);
						sap.firefly.ReferenceQueryModel.setConstantByName(
								queryModelStructure, "Result Set Access Mode",
								queryModel.getResultSetAccessMode());
						sap.firefly.ReferenceQueryModel.setConstantByName(
								queryModelStructure, "Sign Presentation",
								queryModel.getSignPresentation());
						buffer = sap.firefly.XStringBuffer.create();
						sap.firefly.ReferenceQueryModel.exportResultAlignments(
								queryModel, queryModelStructure, buffer);
						sap.firefly.ReferenceQueryModel
								.exportConditionalResults(queryModel,
										queryModelStructure, buffer);
						sap.firefly.ReferenceQueryModel.setConstantByName(
								queryModelStructure, "Alignment Location",
								queryModel.getSupportedResultAlignmentLevel());
						sap.firefly.ReferenceQueryModel
								.setConstantByName(
										queryModelStructure,
										"Result Structure Reordering",
										queryModel
												.getResultStructureReorderingCapability());
						queryModelStructure
								.setBooleanByName("Data Entry Enabled",
										queryModel.getQueryManager()
												.isDataEntryEnabled());
						queryModelStructure.setBooleanByName(
								"Data Entry Read-Only Supported", queryModel
										.getQueryManager()
										.supportsDataEntryReadOnly());
						axesList = queryModelStructure.setNewListByName("Axes");
						sap.firefly.ReferenceQueryModel.exportAxis(queryModel
								.getRowsAxis(), axesList, "Rows", buffer);
						sap.firefly.ReferenceQueryModel.exportAxis(queryModel
								.getColumnsAxis(), axesList, "Columns", buffer);
						sap.firefly.ReferenceQueryModel.exportAxis(queryModel
								.getFreeAxis(), axesList, "Free", buffer);
						sap.firefly.ReferenceQueryModel.exportAxis(queryModel
								.getDynamicAxis(), axesList, "Dynamic", buffer);
						sap.firefly.ReferenceQueryModel.exportAxis(queryModel
								.getFilterAxis(), axesList, "Filter", buffer);
						sap.firefly.ReferenceQueryModel.exportAxis(queryModel
								.getRepositoryAxis(), axesList, "Repository",
								buffer);
						this.exportDimensionList(queryModel.getDimensions(),
								queryModelStructure, "Dimensions", false,
								buffer);
						sap.firefly.ReferenceQueryModel.exportDataCellList(
								queryModel.getQueryDataCells(),
								queryModelStructure);
						sap.firefly.ReferenceQueryModel
								.exportVariableProcessor(queryModel,
										queryModelStructure, buffer);
						this._exportSelector(queryModel.getSelector(),
								queryModelStructure, "Selector", buffer);
						sap.firefly.ReferenceQueryModel.exportConditions(
								queryModel.getConditionManager(),
								queryModelStructure);
						sap.firefly.ReferenceQueryModel.exportExceptions(
								queryModel.getExceptionManager(),
								queryModelStructure);
						sap.firefly.ReferenceQueryModel
								.exportExtendedDimensions(queryModel
										.getExtendedDimensions(),
										queryModelStructure);
					},
					exportStructureMember : function(member, membersList) {
						var memberStructure = membersList.addNewStructure();
						var fieldValues = member.getAllFieldValues();
						var fieldValuesList = memberStructure
								.setNewListByName("Field Values");
						var fieldValueNames = sap.firefly.XListOfString
								.createFromReadOnlyList(fieldValues
										.getKeysAsReadOnlyListOfString());
						var lenFields;
						var fieldValueNameIndex;
						var ignoredExternalDimensions;
						var ignoredExternalDimenionsList;
						var lenIgnored;
						var ignoredExternalDimensionIndex;
						var queryDataCells;
						var queryDataCellsList;
						var lenDataCells;
						var queryDataCellsIndex;
						var sortingManager;
						var measureSorting;
						var resultSetSorting;
						var memberType;
						var formulaMeasureStructure;
						var formulaMeasure;
						var formulaItem;
						var formulaItemElement;
						var restrictedMeasureStructure;
						var restrictedMeasure;
						var filterExpression;
						var aggregationDimensionName;
						var postAggregationDimensions;
						var postAggregationDimensionsList;
						var lenPostAggre;
						var postAggregationDimensionsIndex;
						var postAggregationDimension;
						fieldValueNames
								.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
						lenFields = fieldValueNames.size();
						for (fieldValueNameIndex = 0; fieldValueNameIndex < lenFields; fieldValueNameIndex++) {
							sap.firefly.ReferenceQueryModel.exportFieldValue(
									fieldValues.getByKey(fieldValueNames
											.get(fieldValueNameIndex)),
									fieldValuesList);
						}
						fieldValueNames.releaseObject();
						sap.firefly.ReferenceQueryModel.setNameIfNotNull(
								memberStructure, "Aggregation Type", member
										.getAggregationType());
						sap.firefly.ReferenceQueryModel.exportExceptionsList(
								member.getExceptions(), memberStructure);
						ignoredExternalDimensions = member
								.getIgnoredExternalDimensions();
						if (ignoredExternalDimensions !== null) {
							ignoredExternalDimenionsList = memberStructure
									.setNewListByName("Ignored External Dimensions");
							lenIgnored = ignoredExternalDimensions.size();
							for (ignoredExternalDimensionIndex = 0; ignoredExternalDimensionIndex < lenIgnored; ignoredExternalDimensionIndex++) {
								ignoredExternalDimenionsList
										.addString(ignoredExternalDimensions
												.get(ignoredExternalDimensionIndex));
							}
						}
						sap.firefly.ReferenceQueryModel.setIntegerIfNotNull(
								memberStructure, "Numeric Precision", member
										.getNumericPrecision());
						sap.firefly.ReferenceQueryModel.setIntegerIfNotNull(
								memberStructure, "Numeric Scale", member
										.getNumericScale());
						sap.firefly.ReferenceQueryModel.setIntegerIfNotNull(
								memberStructure, "Numeric Shift", member
										.getNumericShift());
						queryDataCells = member.getQueryDataCells();
						queryDataCellsList = memberStructure
								.setNewListByName("Query Data Cells");
						lenDataCells = queryDataCells.size();
						for (queryDataCellsIndex = 0; queryDataCellsIndex < lenDataCells; queryDataCellsIndex++) {
							queryDataCellsList.addString(queryDataCells.get(
									queryDataCellsIndex).getName());
						}
						sortingManager = member.getQueryModel()
								.getSortingManager();
						measureSorting = sortingManager.getMeasureSorting(
								member, false);
						if (measureSorting !== null) {
							resultSetSorting = sap.firefly.ReferenceQueryModel
									.exportSorting(measureSorting);
							if (resultSetSorting !== null) {
								memberStructure.setElementByName(
										"Result Set Sorting", resultSetSorting);
							}
						}
						memberType = member.getMemberType();
						if (memberType !== null) {
							memberStructure.setStringByName("Member Type",
									memberType.getName());
							if (memberType === sap.firefly.MemberType.FORMULA) {
								formulaMeasureStructure = memberStructure
										.setNewStructureByName("Formula Measure");
								formulaMeasure = member;
								formulaItem = formulaMeasure.getFormula();
								if (formulaItem !== null) {
									formulaItemElement = formulaItem
											.serializeToElement(
													sap.firefly.QModelFormat.INA_METADATA,
													null);
									if (formulaItemElement !== null) {
										formulaMeasureStructure
												.setElementByName("Formula",
														formulaItemElement);
									}
								}
								sap.firefly.ReferenceQueryModel
										.setBoolIfTrue(
												memberStructure,
												"Is Calculated Before Aggregation",
												formulaMeasure
														.isCalculatedBeforeAggregation());
							} else {
								if (memberType === sap.firefly.MemberType.RESTRICTED_MEASURE) {
									restrictedMeasureStructure = memberStructure
											.setNewStructureByName("Restricted Measure");
									restrictedMeasure = member;
									filterExpression = restrictedMeasure
											.getFilter();
									if (filterExpression !== null) {
										this.exportSelectionContainer(
												filterExpression,
												restrictedMeasureStructure,
												"Filter");
									}
									aggregationDimensionName = restrictedMeasure
											.getAggregationDimensionName();
									if (sap.firefly.XStringUtils
											.isNotNullAndNotEmpty(aggregationDimensionName)) {
										restrictedMeasureStructure
												.setStringByName(
														"Aggregation Dimension Name",
														aggregationDimensionName);
									}
									sap.firefly.ReferenceQueryModel
											.setNameIfNotNull(
													restrictedMeasureStructure,
													"Post Aggregation Type",
													restrictedMeasure
															.getPostAggregationType());
									postAggregationDimensions = restrictedMeasure
											.getPostAggregationDimensions();
									postAggregationDimensionsList = restrictedMeasureStructure
											.setNewListByName("Post Aggregation Dimensions");
									lenPostAggre = postAggregationDimensions
											.size();
									for (postAggregationDimensionsIndex = 0; postAggregationDimensionsIndex < lenPostAggre; postAggregationDimensionsIndex++) {
										postAggregationDimension = postAggregationDimensions
												.get(postAggregationDimensionsIndex);
										if (postAggregationDimension === null) {
											postAggregationDimensionsList
													.addNull();
										} else {
											postAggregationDimensionsList
													.addString(postAggregationDimension);
										}
									}
								}
							}
						}
						sap.firefly.ReferenceQueryModel.setBoolIfTrue(
								memberStructure,
								"Is Ignoring All External Dimensions", member
										.isIgnoringAllExternalDimensions());
						sap.firefly.ReferenceQueryModel.setBoolIfTrue(
								memberStructure, "Has Sorting",
								measureSorting !== null);
						sap.firefly.ReferenceQueryModel.setBoolIfTrue(
								memberStructure, "Supports Sorting",
								sortingManager.supportsMeasureSorting());
					},
					exportDimensionList : function(dimensions, jsonStructure,
							name, onlyDimensionName, buffer) {
						var dimensionsSorted = sap.firefly.ReferenceQueryModel
								.getDimensionsSorted(dimensions);
						var dimensionsList = jsonStructure
								.setNewListByName(name);
						var lenDims = dimensionsSorted.size();
						var dimensionIndex;
						var dimension;
						var dimensionStructure;
						for (dimensionIndex = 0; dimensionIndex < lenDims; dimensionIndex++) {
							dimension = dimensionsSorted.get(dimensionIndex);
							if (onlyDimensionName) {
								dimensionsList.addString(dimension.getName());
							} else {
								dimensionStructure = dimensionsList
										.addNewStructure();
								this.exportDimension(dimension,
										dimensionStructure, buffer);
							}
						}
					},
					exportStructure : function(structure, jsonStructure, buffer) {
						var structureMembers;
						var structureMemberList;
						var structureMemberNames;
						var structureMemberNameIndex;
						var structureMemberIndex;
						var structureLayout;
						var lenLayout;
						var structureLayoutIndex;
						var layoutMember;
						sap.firefly.ReferenceQueryModel.setBoolIfTrue(
								jsonStructure, "Measure Structure", structure
										.isMeasureStructure());
						structureMembers = structure.getAllStructureMembers();
						if (sap.firefly.XCollectionUtils
								.hasElements(structureMembers)) {
							structureMemberList = jsonStructure
									.setNewListByName("Structure Members");
							if (this.m_ignoreStructureMemberOrder) {
								structureMemberNames = sap.firefly.XListOfString
										.createFromReadOnlyList(structureMembers
												.getKeysAsReadOnlyListOfString());
								structureMemberNames
										.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
								for (structureMemberNameIndex = 0; structureMemberNameIndex < structureMemberNames
										.size(); structureMemberNameIndex++) {
									this
											.exportStructureMember(
													structureMembers
															.getByKey(structureMemberNames
																	.get(structureMemberNameIndex)),
													structureMemberList);
								}
							} else {
								for (structureMemberIndex = 0; structureMemberIndex < structureMembers
										.size(); structureMemberIndex++) {
									this.exportStructureMember(structureMembers
											.get(structureMemberIndex),
											structureMemberList);
								}
							}
						}
						buffer.clear();
						structureLayout = structure.getStructureLayout();
						lenLayout = structureLayout.size();
						for (structureLayoutIndex = 0; structureLayoutIndex < lenLayout; structureLayoutIndex++) {
							layoutMember = structureLayout
									.get(structureLayoutIndex);
							if (layoutMember === null) {
								continue;
							}
							if (buffer.length() > 0) {
								buffer.append("|");
							}
							buffer.append(layoutMember.getName());
						}
						if (buffer.length() > 0) {
							jsonStructure.setStringByName(
									"Layout Structure Members", buffer
											.toString());
						}
					},
					exportDimension : function(dimension, jsonStructure, buffer) {
						var dimensionType;
						var structureStructure;
						var supportedAxesTypes;
						var supportedAxesNames;
						var allAxesTypes;
						var lenAxes;
						var axesTypeIndex;
						var axisType;
						var lenSupportedAxes;
						var axesNameIndex;
						var groupingDimensions;
						var groupingDimensionsList;
						var lenGrouping;
						var j;
						var groupingDimension;
						var fieldContainer;
						var fields;
						var fieldsList;
						var lenFields;
						var i;
						var fieldStructure;
						var resultSetFields;
						var lenResultFields;
						var resultSetFieldIndex;
						var resultSetField;
						jsonStructure.setStringByName("Dimension", dimension
								.getName());
						dimensionType = dimension.getDimensionType();
						if (dimensionType === null) {
							jsonStructure.setNullByName("Dimension Type");
						} else {
							jsonStructure.setStringByName("Dimension Type",
									dimensionType.getName());
							if (dimensionType
									.isTypeOf(sap.firefly.DimensionType.ABSTRACT_STRUCTURE)) {
								structureStructure = jsonStructure
										.setNewStructureByName("Structure");
								this.exportStructure(dimension,
										structureStructure, buffer);
							}
						}
						supportedAxesTypes = dimension.getSupportedAxesTypes();
						if (supportedAxesTypes.hasElements()) {
							supportedAxesNames = sap.firefly.XListOfString
									.create();
							allAxesTypes = sap.firefly.AxisType.getAll();
							lenAxes = allAxesTypes.size();
							for (axesTypeIndex = 0; axesTypeIndex < lenAxes; axesTypeIndex++) {
								axisType = allAxesTypes.get(axesTypeIndex);
								if (supportedAxesTypes.contains(axisType)) {
									supportedAxesNames.add(axisType.getName());
								}
							}
							supportedAxesNames
									.sortByDirection(sap.firefly.XSortDirection.ASCENDING);
							buffer.clear();
							lenSupportedAxes = supportedAxesNames.size();
							for (axesNameIndex = 0; axesNameIndex < lenSupportedAxes; axesNameIndex++) {
								if (buffer.length() > 0) {
									buffer.append(",");
								}
								buffer.append(supportedAxesNames
										.get(axesNameIndex));
							}
							supportedAxesNames.releaseObject();
							if (buffer.length() > 0) {
								jsonStructure.setStringByName("Supported Axes",
										buffer.toString());
							}
						}
						sap.firefly.ReferenceQueryModel.setConstantByName(
								jsonStructure, "Value Type",
								sap.firefly.XValueType.STRING);
						sap.firefly.ReferenceQueryModel.setConstantByName(
								jsonStructure, "Layout Type", dimension
										.getFieldLayoutType());
						jsonStructure.setBooleanByName("Grouping Dimension",
								dimension.isGroupingDimension());
						groupingDimensions = dimension.getGroupingDimensions();
						if (groupingDimensions.hasElements()) {
							groupingDimensionsList = jsonStructure
									.setNewListByName("Grouping Dimensions");
							lenGrouping = groupingDimensions.size();
							for (j = 0; j < lenGrouping; j++) {
								groupingDimension = groupingDimensions.get(j);
								groupingDimensionsList
										.addString(groupingDimension.getName());
							}
						}
						jsonStructure.setBooleanByName("Selectable", dimension
								.isSelectable());
						fieldContainer = dimension.getFieldContainer();
						if (fieldContainer !== null) {
							fields = sap.firefly.ReferenceQueryModel
									.getFieldsSorted(fieldContainer.getFields());
							if (sap.firefly.XCollectionUtils
									.hasElements(fields)) {
								fieldsList = jsonStructure
										.setNewListByName("Fields");
								lenFields = fields.size();
								for (i = 0; i < lenFields; i++) {
									fieldStructure = sap.firefly.ReferenceQueryModel
											.exportField(fields.get(i));
									if (fieldStructure !== null) {
										fieldsList.add(fieldStructure);
									}
								}
							}
							buffer.clear();
							resultSetFields = sap.firefly.ReferenceQueryModel
									.getFieldsSorted(fieldContainer
											.getResultSetFields());
							lenResultFields = resultSetFields.size();
							for (resultSetFieldIndex = 0; resultSetFieldIndex < lenResultFields; resultSetFieldIndex++) {
								resultSetField = resultSetFields
										.get(resultSetFieldIndex);
								if (resultSetField === null) {
									continue;
								}
								if (buffer.length() > 0) {
									buffer.append("|");
								}
								buffer.append(resultSetField.getName());
							}
							if (buffer.length() > 0) {
								jsonStructure.setStringByName(
										"Result Set Fields", buffer.toString());
							}
						}
						this.exportAttributeContainer(dimension
								.getAttributeContainer(), jsonStructure
								.setNewStructureByName("Attribute Container"),
								buffer);
						sap.firefly.ReferenceQueryModel
								.exportDimensionHierarchies(dimension,
										jsonStructure);
					},
					exportAttributeContainer : function(attributeContainer,
							jsonStructure, buffer) {
						var resultSetAttributes;
						var lenResultAttributes;
						var resultSetAttributesIndex;
						var resultSetAttribute;
						var attributes;
						var attributesList;
						var lenAttributes;
						var attributesIndex;
						buffer.clear();
						sap.firefly.ReferenceQueryModel.setNameIfNotNull(
								jsonStructure, "Main Attribute",
								attributeContainer.getMainAttribute());
						resultSetAttributes = attributeContainer
								.getResultSetAttributes();
						lenResultAttributes = resultSetAttributes.size();
						for (resultSetAttributesIndex = 0; resultSetAttributesIndex < lenResultAttributes; resultSetAttributesIndex++) {
							resultSetAttribute = resultSetAttributes
									.get(resultSetAttributesIndex);
							if (resultSetAttribute === null) {
								continue;
							}
							if (buffer.length() > 0) {
								buffer.append("|");
							}
							buffer.append(resultSetAttribute.getName());
						}
						if (buffer.length() > 0) {
							jsonStructure.setStringByName(
									"Result Set Attributes", buffer.toString());
						}
						attributes = sap.firefly.ReferenceQueryModel
								.getAttributesSorted(attributeContainer
										.getAttributes());
						if (sap.firefly.XCollectionUtils
								.hasElements(attributes)) {
							attributesList = jsonStructure
									.setNewListByName("Attributes");
							lenAttributes = attributes.size();
							for (attributesIndex = 0; attributesIndex < lenAttributes; attributesIndex++) {
								this.exportAttribute(attributes
										.get(attributesIndex), attributesList,
										buffer);
							}
						}
					},
					exportAttribute : function(attribute, jsonList, buffer) {
						var attributeStructure;
						var attributeFields;
						var lenAttrFields;
						var attributeFieldIndex;
						var attributeField;
						var childAttributes;
						var childList;
						var lenChildAttr;
						var i;
						buffer.clear();
						attributeStructure = jsonList.addNewStructure();
						attributeStructure.setStringByName("Attribute",
								attribute.getName());
						attributeStructure.setStringByName("Text", attribute
								.getText());
						attributeFields = sap.firefly.ReferenceQueryModel
								.getFieldsSorted(attribute.getFields());
						lenAttrFields = attributeFields.size();
						for (attributeFieldIndex = 0; attributeFieldIndex < lenAttrFields; attributeFieldIndex++) {
							attributeField = attributeFields
									.get(attributeFieldIndex);
							if (attributeField === null) {
								continue;
							}
							if (buffer.length() > 0) {
								buffer.append("|");
							}
							buffer.append(attributeField.getName());
						}
						if (buffer.length() > 0) {
							attributeStructure.setStringByName("Fields", buffer
									.toString());
						}
						childAttributes = attribute.getChildAttributes();
						if (sap.firefly.XCollectionUtils
								.hasElements(childAttributes)) {
							childList = attributeStructure
									.setNewListByName("Child Attributes");
							lenChildAttr = childAttributes.size();
							for (i = 0; i < lenChildAttr; i++) {
								this.exportAttribute(childAttributes.get(i),
										childList, buffer);
							}
						}
					},
					exportInfoProvider : function(name, infoProvider,
							jsonStructure) {
						var baseInfoProvider;
						if (infoProvider === null) {
							return;
						}
						jsonStructure.setStringByName(name, infoProvider
								.getName());
						baseInfoProvider = infoProvider.getBaseInfoProvider();
						if ((baseInfoProvider === null)
								|| (infoProvider === baseInfoProvider)) {
							return;
						}
						this.exportInfoProvider(name, baseInfoProvider,
								jsonStructure.setNewStructureByName("Base"));
					},
					_exportSelector : function(selector, jsonStructure, name,
							buffer) {
						var selectorStructure = jsonStructure
								.setNewStructureByName(name);
						this.exportDimensionList(selector
								.getSelectableDimensions(), selectorStructure,
								"Selectable Dimensions", true, buffer);
						selectorStructure.setBooleanByName(
								"Supports Complex Selections", selector
										.supportsComplexSelections());
						selectorStructure.setStringByName("Text", selector
								.getText());
						this.exportSelectionContainer(selector
								.getSelectionSpaceContainer(),
								selectorStructure, "Container Selection Space");
						this.exportSelectionContainer(selector
								.getEffectiveSelectionContainer(),
								selectorStructure,
								"Container Effective Selection");
						this.exportSelectionContainer(selector
								.getSelectionStateContainer(),
								selectorStructure, "Container Selection State");
						if (selector.supportsSelectionVisibilityContainer()) {
							this.exportSelectionContainer(selector
									.getSelectionVisibilityContainer(),
									selectorStructure,
									"Container Selection Visibility");
						}
						this
								.exportSelectionContainer(selector
										.getExternSelectionContainer(),
										selectorStructure,
										"Container Extern Selection");
						this.exportSelectionContainer(selector
								.getSelectionTmpContainer(), selectorStructure,
								"Container Selection Tmp");
						this.exportSelectionContainer(selector
								.getSelectorContainer(), selectorStructure,
								"Container Selector");
					},
					exportSelectionComponent : function(selectionComponent,
							jsonStructure) {
						var type;
						var componentStructure;
						if (selectionComponent === null) {
							return;
						}
						type = selectionComponent.getComponentType();
						if (type === null) {
							jsonStructure.setNullByName("Type");
							return;
						}
						jsonStructure.setStringByName("Type", type.toString());
						componentStructure = jsonStructure
								.setNewStructureByName("Component");
						if (type === sap.firefly.FilterComponentType.NOT) {
							this.exportSelectionNot(selectionComponent,
									componentStructure);
						} else {
							if (type === sap.firefly.FilterComponentType.AND) {
								this.exportSelectionLogicalContainer(
										selectionComponent, componentStructure);
							} else {
								if (type === sap.firefly.FilterComponentType.OR) {
									this.exportSelectionLogicalContainer(
											selectionComponent,
											componentStructure);
								} else {
									if (type === sap.firefly.FilterComponentType.CARTESIAN_PRODUCT) {
										sap.firefly.ReferenceQueryModel
												.exportSelectionCartesianProduct(
														selectionComponent,
														componentStructure);
									} else {
										if (type === sap.firefly.FilterComponentType.CARTESIAN_LIST) {
											sap.firefly.ReferenceQueryModel
													.exportSelectionSignedSet(
															selectionComponent,
															componentStructure);
										} else {
											if (type === sap.firefly.FilterComponentType.OPERATION) {
												sap.firefly.ReferenceQueryModel
														.exportSelectionPrimitiveOperation(
																selectionComponent,
																componentStructure);
											} else {
												throw sap.firefly.XException
														.createIllegalStateException("Illegal selection component type");
											}
										}
									}
								}
							}
						}
					},
					exportSelectionNot : function(selectionComponent,
							jsonStructure) {
						this.exportSelectionComponent(selectionComponent
								.getChild(), jsonStructure
								.setNewStructureByName("Child Component"));
					},
					exportSelectionLogicalContainer : function(
							selectionComponent, jsonStructure) {
						var jsonList = jsonStructure
								.setNewListByName("Child Components");
						var size = selectionComponent.size();
						var i;
						for (i = 0; i < size; i++) {
							this.exportSelectionComponent(selectionComponent
									.get(i), jsonList.addNewStructure());
						}
					},
					exportSelectionContainer : function(selectionContainer,
							jsonStructure, name) {
						var structure;
						var complexSelectionRoot;
						var cartesianProduct;
						if (selectionContainer === null) {
							jsonStructure.setNullByName(name);
							return;
						}
						structure = jsonStructure.setNewStructureByName(name);
						structure.setBooleanByName("Is Locked",
								selectionContainer.isLocked());
						structure.setBooleanByName(
								"Global Literal Filter Supported",
								selectionContainer
										.supportsGlobalLiteralFilter());
						if (selectionContainer.supportsGlobalLiteralFilter()) {
							sap.firefly.ReferenceQueryModel
									.exportSelectionValue(selectionContainer
											.getGlobalLiteralFilter(),
											jsonStructure,
											"Global Literal Filter");
						}
						structure.setBooleanByName(
								"Complex Selections Supported",
								selectionContainer.supportsComplexSelections());
						if (selectionContainer.supportsComplexSelections()) {
							complexSelectionRoot = selectionContainer
									.getComplexSelectionRoot();
							if (complexSelectionRoot !== null) {
								this
										.exportSelectionComponent(
												complexSelectionRoot,
												structure
														.setNewStructureByName("Complex Selection Root"));
							}
						}
						if (selectionContainer.isCartesianProduct()) {
							cartesianProduct = selectionContainer
									.getCartesianProduct();
							if (cartesianProduct !== null) {
								sap.firefly.ReferenceQueryModel
										.exportSelectionCartesianProduct(
												cartesianProduct,
												structure
														.setNewStructureByName("Cartesian Product"));
							}
						}
					},
					setIgnoreStructureMemberOrder : function(
							ignoreStructureMemberOrder) {
						this.m_ignoreStructureMemberOrder = ignoreStructureMemberOrder;
						return this;
					},
					releaseObject : function() {
						this.m_queryModel = null;
						sap.firefly.ReferenceQueryModel.$superclass.releaseObject
								.call(this);
					},
					toString : function() {
						return this.exportToAscii();
					}
				});
$Firefly.createClass("sap.firefly.TmxExprHelper", sap.firefly.XObject, {
	m_opExpCurrentElement : null,
	m_opExpRootElement : null,
	releaseObject : function() {
		this.m_opExpCurrentElement = null;
		this.m_opExpRootElement = null;
		sap.firefly.TmxExprHelper.$superclass.releaseObject.call(this);
	}
});
$Firefly
		.createClass(
				"sap.firefly.ReferenceGrid2",
				sap.firefly.ReferenceGrid,
				{
					$statics : {
						createWithName2 : function(gridName, resultSet) {
							var object = new sap.firefly.ReferenceGrid2();
							object.setupSimpleGrid(resultSet, false);
							return object;
						}
					},
					prepareCellStructure : function(useRowsHeaderPane,
							useColumnsHeaderPane) {
						if (this.m_resultSet !== null) {
							this.prepareStructure(useRowsHeaderPane,
									useColumnsHeaderPane);
						}
					},
					setDataCells : function() {
						var dc = this.m_resultSet.getDataColumns();
						var dr = this.m_resultSet.getDataRows();
						var y;
						var x;
						var dataCell;
						var value;
						var stringRepresentation;
						var formatDoubleToString;
						var cell;
						for (y = 0; y < dr; y++) {
							for (x = 0; x < dc; x++) {
								dataCell = this.m_resultSet.getDataCell(x, y);
								value = dataCell.getFormattedValue();
								if ((dataCell.getXValue() !== null)
										&& (dataCell.getXValue().getValueType() === sap.firefly.XValueType.DOUBLE)) {
									stringRepresentation = dataCell.getXValue()
											.getStringRepresentation();
									value = sap.firefly.XNumberFormatter
											.formatDoubleToString(
													sap.firefly.XDouble
															.convertStringToDouble(stringRepresentation),
													"#,#.###");
								}
								formatDoubleToString = sap.firefly.ReferenceGrid
										.getCellValue(value, dataCell);
								cell = sap.firefly.ReferenceGridCell.create(
										formatDoubleToString, false, dataCell);
								sap.firefly.ReferenceGrid2.$superclass.setCell
										.call(this, x + this.m_fixedWidth, y
												+ this.m_fixedHeight, cell,
												false);
							}
						}
					}
				});
$Firefly.createClass("sap.firefly.TmxFactoryImpl", sap.firefly.TmxFactory,
		{
			$statics : {
				staticSetup : function() {
					sap.firefly.TmxFactory
							.setFactory(new sap.firefly.TmxFactoryImpl());
				}
			},
			createUsingFactory : function(application) {
				var tmxCore;
				var newApplication;
				if (application !== null) {
					tmxCore = sap.firefly.Tmx.create(application, false);
				} else {
					newApplication = sap.firefly.ApplicationFactory
							.createApplication(null);
					tmxCore = sap.firefly.Tmx.create(newApplication, true);
				}
				return tmxCore;
			},
			createStandaloneInFactory : function(landscapeUrl) {
				var result = sap.firefly.ApplicationFactory
						.createApplicationWithLandscapeBlocking(null,
								landscapeUrl);
				var application;
				var tmxCore;
				if (result.isValid()) {
					application = result.getData();
					tmxCore = sap.firefly.Tmx.create(application, true);
					return sap.firefly.ExtResult.create(tmxCore, result);
				}
				return sap.firefly.ExtResult.create(null, result);
			}
		});
$Firefly
		.createClass(
				"sap.firefly.Tmx",
				sap.firefly.MessageManager,
				{
					$statics : {
						create : function(application,
								keepHardReferenceForApplication) {
							var object = new sap.firefly.Tmx();
							object.setupTmx(application,
									keepHardReferenceForApplication);
							return object;
						}
					},
					m_applicationHardRef : null,
					m_applicationWeakRef : null,
					m_activeQueryManager : null,
					m_dplookup : null,
					setupTmx : function(application,
							keepHardReferenceForApplication) {
						this.setup();
						if (keepHardReferenceForApplication) {
							this.m_applicationHardRef = application;
						}
						this.m_applicationWeakRef = sap.firefly.XWeakReferenceUtil
								.getWeakRef(application);
					},
					releaseObject : function() {
						this.m_activeQueryManager = sap.firefly.XObject
								.releaseIfNotNull(this.m_activeQueryManager);
						this.m_applicationHardRef = sap.firefly.XObject
								.releaseIfNotNull(this.m_applicationHardRef);
						this.m_applicationWeakRef = sap.firefly.XObject
								.releaseIfNotNull(this.m_applicationWeakRef);
						this.m_dplookup = sap.firefly.XObject
								.releaseIfNotNull(this.m_dplookup);
						sap.firefly.Tmx.$superclass.releaseObject.call(this);
					},
					onQueryManagerCreated : function(extResult, queryManager,
							customIdentifier) {
						this.addAllMessages(extResult);
						if (extResult.isValid()) {
							this.m_activeQueryManager = extResult.getData();
							this.m_activeQueryManager.processQueryExecution(
									null, this, null);
						}
					},
					onQueryExecuted : function(extResult, resultSetContainer,
							customIdentifier) {
						this.addAllMessages(extResult);
					},
					getSession : function() {
						return this.getApplication();
					},
					getApplication : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_applicationWeakRef);
					},
					tmx : function(cmdline) {
						var result = sap.firefly.TmxParser
								.parseExpression(cmdline);
						var rootToken;
						this.clearMessages();
						this.addAllMessages(result);
						if (result.isValid()) {
							rootToken = result.getRootToken();
							sap.firefly.XLogger.println(rootToken.toString());
						}
						result.releaseObject();
						return this;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.TmxModel",
				sap.firefly.XObject,
				{
					$statics : {
						create : function(queryModel) {
							var tmxModel = new sap.firefly.TmxModel();
							tmxModel.m_queryModel = queryModel;
							return tmxModel;
						},
						combineFilters : function(existingFilter, newFilter) {
							var newFilterAnd;
							if (existingFilter === null) {
								return newFilter;
							}
							if (newFilter === null) {
								return existingFilter;
							}
							if (existingFilter.getComponentType() === sap.firefly.FilterComponentType.AND) {
								newFilterAnd = existingFilter;
							} else {
								newFilterAnd = sap.firefly.QFactory2
										.newFilterAnd(existingFilter);
								newFilterAnd.add(existingFilter);
							}
							newFilterAnd.add(newFilter);
							return newFilterAnd;
						}
					},
					m_queryModel : null,
					m_existingFilter : null,
					releaseObject : function() {
						this.m_queryModel = null;
						this.m_existingFilter = null;
						sap.firefly.TmxModel.$superclass.releaseObject
								.call(this);
					},
					clearFilter : function(dimensionName) {
						var selectionStateContainer = this.m_queryModel
								.getSelector().getSelectionStateContainer();
						var cartesianProduct = selectionStateContainer
								.getCartesianProduct();
						var cartesianList;
						if (cartesianProduct !== null) {
							cartesianList = cartesianProduct
									.getCartesianListByDimensionName(dimensionName);
							if (cartesianList !== null) {
								cartesianList.clear();
							}
						}
					},
					addTotals : function(dimension, totalResultAlignment) {
						if ((dimension !== null)
								&& (totalResultAlignment !== null)) {
							dimension.setResultAlignment(totalResultAlignment);
							dimension.setResultVisibilityByElementAndAlignment(
									totalResultAlignment,
									sap.firefly.ResultStructureElement.TOTAL,
									sap.firefly.ResultVisibility.VISIBLE);
						}
					},
					addMultipleMembersFilter : function(field, names) {
						var selectionStateContainer = this.m_queryModel
								.getSelector().getSelectionStateContainer();
						var nameSize = names.size();
						var orFilter;
						var i;
						var filterOperation;
						var low;
						var valueType;
						var name;
						var cartesianProduct;
						var cartesianList;
						var j;
						var filterOperation2;
						if (selectionStateContainer.supportsComplexSelections()) {
							orFilter = sap.firefly.QFactory2
									.newFilterOr(selectionStateContainer);
							for (i = 0; i < nameSize; i++) {
								filterOperation = sap.firefly.QFactory2
										.newFilterOperation(selectionStateContainer);
								filterOperation.setField(field);
								filterOperation
										.setComparisonOperator(sap.firefly.ComparisonOperator.EQUAL);
								low = filterOperation.getLow();
								valueType = field.getValueType();
								name = names.get(i);
								if (valueType === sap.firefly.XValueType.STRING) {
									low.setStringValue(name);
								} else {
									if (valueType === sap.firefly.XValueType.LONG) {
										low.setLongValue(sap.firefly.XLong
												.convertStringToLong(name));
									} else {
										if (valueType === sap.firefly.XValueType.INTEGER) {
											low
													.setIntegerValue(sap.firefly.XInteger
															.convertStringToInteger(name));
										} else {
											if (valueType === sap.firefly.XValueType.DOUBLE) {
												low
														.setDoubleValue(sap.firefly.XDouble
																.convertStringToDouble(name));
											} else {
												if (valueType === sap.firefly.XValueType.DATE) {
													low
															.setDateValue(sap.firefly.XDate
																	.createDateFromIsoFormat(name));
												} else {
													if (valueType === sap.firefly.XValueType.TIME) {
														low
																.setTimeValue(sap.firefly.XTime
																		.createTimeFromIsoFormat(name));
													} else {
														if (valueType === sap.firefly.XValueType.DATE_TIME) {
															low
																	.setDateTimeValue(sap.firefly.XDateTime
																			.createDateTimeFromIsoFormat(name));
														}
													}
												}
											}
										}
									}
								}
								orFilter.add(filterOperation);
							}
							this.m_existingFilter = sap.firefly.TmxModel
									.combineFilters(this.m_existingFilter,
											orFilter);
							if (this.m_existingFilter !== null) {
								selectionStateContainer
										.setComplexSelection(this.m_existingFilter);
							}
						} else {
							cartesianProduct = selectionStateContainer
									.getCartesianProductWithDefault();
							cartesianList = cartesianProduct
									.getCartesianListByField(field);
							for (j = 0; j < nameSize; j++) {
								filterOperation2 = sap.firefly.QFactory2
										.newFilterCartesianElement(field);
								filterOperation2.setField(field);
								filterOperation2
										.setComparisonOperator(sap.firefly.ComparisonOperator.EQUAL);
								filterOperation2.getLow().setStringValue(
										names.get(j));
								cartesianList.add(filterOperation2);
							}
						}
						return true;
					},
					addFilter : function(element) {
						var selectionStateContainer;
						this.m_existingFilter = sap.firefly.TmxModel
								.combineFilters(this.m_existingFilter, element);
						if (this.m_existingFilter !== null) {
							selectionStateContainer = this.m_queryModel
									.getSelector().getSelectionStateContainer();
							selectionStateContainer
									.setComplexSelection(this.m_existingFilter);
						}
						return true;
					},
					setAsExceptionAggregation : function(aggregationType,
							measure, hasNoAggregationDimensions) {
						if (this.m_queryModel
								.supportsExceptionAggregationDimsFormulas()) {
							if (sap.firefly.XStringUtils.isNullOrEmpty(measure
									.getAggregationDimensionName())
									&& (((aggregationType === sap.firefly.AggregationType.AVERAGE) || (aggregationType === sap.firefly.AggregationType.COUNT)) && hasNoAggregationDimensions)) {
								return false;
							}
							if ((aggregationType !== sap.firefly.AggregationType.SUM)
									&& (aggregationType !== sap.firefly.AggregationType.MIN)
									&& (aggregationType !== sap.firefly.AggregationType.MAX)
									&& (aggregationType !== sap.firefly.AggregationType.NOP_NULL)
									&& (aggregationType !== sap.firefly.AggregationType.NOP_NULL_ZERO)) {
								return true;
							}
						}
						return false;
					},
					createAggregation : function(name, text, type,
							aggregationDimensions, postType,
							postAggregationDimensions) {
						var measureStructure;
						var measure;
						var exceptionSize;
						var i;
						var postSize;
						var n;
						if ((type === null) && (postType === null)) {
							return null;
						}
						measureStructure = this.m_queryModel
								.getMeasureDimension();
						measure = measureStructure.getDimensionMember(name,
								false);
						if (measure === null) {
							measure = measureStructure.addNewRestrictedMeasure(
									name, text);
						}
						if (type !== null) {
							if (this.setAsExceptionAggregation(type, measure,
									aggregationDimensions.isEmpty())) {
								measure.setExceptionAggregationType(type);
							} else {
								measure.setAggregationType(type);
							}
							exceptionSize = aggregationDimensions.size();
							if (this.m_queryModel
									.supportsExceptionAggregationDimsFormulas()) {
								for (i = 0; i < exceptionSize; i++) {
									measure
											.clearExceptionAggregationDimensions();
									measure
											.addExceptionAggregationDimensionName(aggregationDimensions
													.get(i));
								}
							} else {
								if (exceptionSize > 0) {
									measure
											.setAggregationDimensionName(aggregationDimensions
													.get(0));
								}
							}
						}
						if (postType !== null) {
							measure.setPostAggregationType(postType);
							if (postAggregationDimensions !== null) {
								postSize = postAggregationDimensions.size();
								for (n = 0; n < postSize; n++) {
									measure
											.addPostAggregationDimensionName(postAggregationDimensions
													.get(n));
								}
							}
						}
						return measure;
					},
					getContext : function() {
						return this.m_queryModel;
					},
					getOlapEnv : function() {
						return null;
					},
					getApplication : function() {
						return null;
					},
					getSession : function() {
						return null;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.TmxParser",
				sap.firefly.MessageManager,
				{
					$statics : {
						parseExpression : function(expression) {
							var parser = new sap.firefly.TmxParser();
							parser.setupParser(expression);
							parser.execute();
							return parser;
						},
						applyTmx : function(queryModel, expression) {
							var parser = sap.firefly.TmxParser
									.parseExpression(expression);
							var tmxModel;
							if (parser.isValid()) {
								tmxModel = sap.firefly.TmxModel
										.create(queryModel);
								parser.applyExpression(tmxModel);
								tmxModel.releaseObject();
							}
							return parser;
						},
						addPresentationType : function(presentationType,
								resultSetFields, dimension) {
							if (sap.firefly.XString.isEqual("key",
									presentationType)) {
								resultSetFields.add(dimension.getKeyField());
							} else {
								if (sap.firefly.XString.isEqual("text",
										presentationType)) {
									resultSetFields.add(dimension
											.getTextField());
								} else {
									if (sap.firefly.XString.isEqual(
											"displaykey", presentationType)) {
										resultSetFields.add(dimension
												.getDisplayKeyField());
									} else {
										return false;
									}
								}
							}
							return true;
						},
						addFilterOperation : function(comparisonOperator,
								dimension, valueToken) {
							var keyField = dimension.getKeyField();
							var op = sap.firefly.QFactory2
									.newFilterOperation(keyField);
							var valueType;
							var date;
							var dateTime;
							op.setComparisonOperator(comparisonOperator);
							op.setField(keyField);
							if (dimension.isHierarchyAssignedAndActive()) {
								op.setHierarchyName(dimension.getHierarchy()
										.getName());
							}
							valueType = keyField.getValueType();
							if (valueType === sap.firefly.XValueType.STRING) {
								op.getLow().setStringValue(
										valueToken.getStringValue());
							} else {
								if (valueType === sap.firefly.XValueType.LONG) {
									op.getLow().setLongValue(
											valueToken.getLongValue());
								} else {
									if (valueType === sap.firefly.XValueType.INTEGER) {
										op.getLow().setIntegerValue(
												valueToken.getIntegerValue());
									} else {
										if ((valueType === sap.firefly.XValueType.DOUBLE)
												|| (valueType === sap.firefly.XValueType.DECIMAL_FLOAT)) {
											if (valueToken.getValueType() === sap.firefly.XValueType.DOUBLE) {
												op
														.getLow()
														.setDoubleValue(
																valueToken
																		.getDoubleValue());
											} else {
												if (valueToken.getValueType() === sap.firefly.XValueType.INTEGER) {
													op
															.getLow()
															.setDoubleValue(
																	valueToken
																			.getIntegerValue());
												} else {
													if (valueToken
															.getValueType() === sap.firefly.XValueType.LONG) {
														op
																.getLow()
																.setDoubleValue(
																		valueToken
																				.getLongValue());
													}
												}
											}
										} else {
											if (valueType === sap.firefly.XValueType.DATE) {
												date = valueToken
														.getDateValue();
												if (date === null) {
													date = sap.firefly.XDate
															.createDateFromIsoFormat(valueToken
																	.getStringValue());
												}
												op.getLow().setDateValue(date);
											} else {
												if (valueType === sap.firefly.XValueType.TIME) {
													op
															.getLow()
															.setTimeValue(
																	sap.firefly.XTime
																			.createTimeFromIsoFormat(valueToken
																					.getStringValue()));
												} else {
													if (valueType === sap.firefly.XValueType.DATE_TIME) {
														dateTime = valueToken
																.getDateTimeValue();
														if (dateTime === null) {
															dateTime = sap.firefly.XDateTime
																	.createDateTimeFromIsoFormat(valueToken
																			.getStringValue());
														}
														op
																.getLow()
																.setDateTimeValue(
																		dateTime);
													}
												}
											}
										}
									}
								}
							}
							return op;
						},
						transformList : function(token, listType,
								ownerTokenType) {
							var newListToken = sap.firefly.TmxToken
									.createTokenByType(listType, 0);
							var parsedTokens;
							var parsedSize;
							var i;
							var currentToken;
							var currentType;
							if (ownerTokenType === sap.firefly.TmxTokenType.IN) {
								parsedTokens = token.getChildren();
								parsedSize = parsedTokens.size();
								for (i = 0; i < parsedSize; i++) {
									currentToken = parsedTokens.get(i);
									currentType = currentToken.getType();
									if ((currentType === sap.firefly.TmxTokenType.STRING)
											|| (currentType === sap.firefly.TmxTokenType.NAME)
											|| (currentType === sap.firefly.TmxTokenType.NUMBER)
											|| (currentType === sap.firefly.TmxTokenType.DATE)
											|| (currentType === sap.firefly.TmxTokenType.DATETIME)) {
										newListToken.addChild(currentToken);
									}
								}
							}
							return newListToken;
						},
						transformSingleEntity : function(helper, token) {
							if (helper.m_opExpCurrentElement === null) {
								helper.m_opExpCurrentElement = token;
								if (helper.m_opExpRootElement === null) {
									helper.m_opExpRootElement = helper.m_opExpCurrentElement;
								}
							} else {
								helper.m_opExpCurrentElement
										.setRightSide(token);
							}
							return true;
						},
						transformOperator : function(helper, nextOpToken) {
							var nextOpTokenType = nextOpToken.getType();
							var nextOpTokenOperator = nextOpTokenType
									.getOperator();
							var nextOpTokenPrio = nextOpTokenOperator.getPrio();
							var currentNode = helper.m_opExpCurrentElement;
							var currentRightSide;
							var currentOperator;
							var currentPrio;
							var newLeftSide;
							var parent;
							var parentOp;
							var leftSideOperator;
							var leftSideOperator2;
							var hasLeftSideHigherPrioWhenEqual;
							var tmpRightSide;
							var parent2;
							while (true) {
								if (currentNode === null) {
									nextOpToken
											.setLeftSide(helper.m_opExpRootElement);
									helper.m_opExpRootElement
											.setParent(nextOpToken);
									helper.m_opExpRootElement = nextOpToken;
									break;
								}
								currentOperator = currentNode.getType()
										.getOperator();
								if (currentOperator === null) {
									currentNode = currentNode.getParent();
									continue;
								}
								currentPrio = currentOperator.getPrio();
								if (nextOpTokenPrio < currentPrio) {
									currentRightSide = currentNode
											.getRightSide();
									nextOpToken.setLeftSide(currentRightSide);
									currentNode.setRightSide(nextOpToken);
								} else {
									if (nextOpTokenPrio > currentPrio) {
										newLeftSide = currentNode;
										parent = newLeftSide.getParent();
										while (parent !== null) {
											parentOp = parent.getType()
													.getOperator();
											if ((parentOp === null)
													|| (parentOp.getPrio() > nextOpTokenPrio)) {
												break;
											}
											leftSideOperator = newLeftSide
													.getType().getOperator();
											if ((leftSideOperator === nextOpTokenOperator)
													&& (leftSideOperator
															.hasLeftSideHigherPrioWhenEqual() === false)) {
												break;
											}
											newLeftSide = parent;
											parent = newLeftSide.getParent();
										}
										leftSideOperator2 = newLeftSide
												.getType().getOperator();
										hasLeftSideHigherPrioWhenEqual = true;
										if (leftSideOperator2 === nextOpTokenOperator) {
											hasLeftSideHigherPrioWhenEqual = leftSideOperator2
													.hasLeftSideHigherPrioWhenEqual();
										}
										if (hasLeftSideHigherPrioWhenEqual) {
											nextOpToken
													.setLeftSide(newLeftSide);
											if (parent === null) {
												helper.m_opExpRootElement = nextOpToken;
											} else {
												parent
														.setRightSide(nextOpToken);
											}
										} else {
											tmpRightSide = newLeftSide
													.getRightSide();
											newLeftSide
													.setRightSide(nextOpToken);
											nextOpToken
													.setLeftSide(tmpRightSide);
										}
									} else {
										parent2 = currentNode.getParent();
										nextOpToken.setLeftSide(currentNode);
										if (parent2 === null) {
											helper.m_opExpRootElement = nextOpToken;
										} else {
											parent2.setRightSide(nextOpToken);
										}
									}
								}
								break;
							}
							helper.m_opExpCurrentElement = nextOpToken;
							return true;
						},
						startParsing : function() {
							return true;
						},
						endParsing : function() {
							return true;
						}
					},
					m_rootToken : null,
					m_source : null,
					m_isValid : false,
					m_pos : 0,
					m_isTmxInsideJson : false,
					m_jsonParser : null,
					m_stack : null,
					m_preProcessingStack : null,
					setupParser : function(expression) {
						this.setup();
						this.m_stack = sap.firefly.XList.create();
						this.m_preProcessingStack = sap.firefly.XList.create();
						this.m_rootToken = sap.firefly.TmxToken.createToken("",
								sap.firefly.TmxTokenType.ROOT, 0);
						this.pushOntoStack(this.m_rootToken);
						this.m_source = expression;
					},
					releaseObject : function() {
						this.m_stack = sap.firefly.XObject
								.releaseIfNotNull(this.m_stack);
						this.m_preProcessingStack = sap.firefly.XObject
								.releaseIfNotNull(this.m_preProcessingStack);
						this.m_rootToken = sap.firefly.XObject
								.releaseIfNotNull(this.m_rootToken);
						this.m_source = null;
						this.m_jsonParser = null;
						sap.firefly.TmxParser.$superclass.releaseObject
								.call(this);
					},
					execute : function() {
						if (this.runWalker()) {
							this.transformRoot();
						}
					},
					applyExpression : function(tmxModel) {
						var rootToken = this.getRootToken();
						var children = rootToken.getChildren();
						var childrenSize = children.size();
						var i;
						var tmxToken;
						for (i = 0; i < childrenSize; i++) {
							tmxToken = children.get(i);
							if (tmxToken.getType() === sap.firefly.TmxTokenType.QUERY) {
								this.applyQueryToken(tmxModel, tmxToken);
							}
						}
					},
					applyQueryToken : function(tmxModel, queryToken) {
						var selectToken = queryToken
								.getChildByType(sap.firefly.TmxTokenType.SELECT);
						var tmxRows;
						var tmxColumns;
						var tmxFree;
						var whereToken;
						var mainChild;
						var filterElement;
						var membersToken;
						var membersList;
						var memberSize;
						var i;
						var orderBy;
						var orderItem;
						var orderSize;
						var j;
						var offset;
						var offsetItem;
						var offsetSize;
						var n;
						if (selectToken !== null) {
							tmxRows = selectToken
									.getChildByType(sap.firefly.TmxTokenType.ROWS_AXIS);
							this.applyAxis(tmxModel, tmxRows,
									sap.firefly.AxisType.ROWS);
							tmxColumns = selectToken
									.getChildByType(sap.firefly.TmxTokenType.COLUMN_AXIS);
							this.applyAxis(tmxModel, tmxColumns,
									sap.firefly.AxisType.COLUMNS);
							tmxFree = selectToken
									.getChildByType(sap.firefly.TmxTokenType.FREE_AXIS);
							this.applyAxis(tmxModel, tmxFree,
									sap.firefly.AxisType.FREE);
						}
						whereToken = queryToken
								.getChildByType(sap.firefly.TmxTokenType.WHERE);
						if (whereToken !== null) {
							mainChild = whereToken.getMainChild();
							filterElement = this.applyFilter(tmxModel,
									mainChild);
							if (filterElement === null) {
								return;
							}
							tmxModel.addFilter(filterElement);
						}
						membersToken = queryToken
								.getChildByType(sap.firefly.TmxTokenType.MEMBERS);
						if (membersToken !== null) {
							membersList = membersToken.getChildren();
							memberSize = membersList.size();
							for (i = 0; i < memberSize; i++) {
								this.applyMemberDefinition(tmxModel,
										membersList.get(i));
							}
						}
						orderBy = queryToken
								.getChildByType(sap.firefly.TmxTokenType.ORDER_BY);
						if (orderBy !== null) {
							orderItem = orderBy.getChildren();
							orderSize = orderItem.size();
							for (j = 0; j < orderSize; j++) {
								this.applyOrderItem(tmxModel, orderItem.get(j));
							}
						}
						offset = queryToken
								.getChildByType(sap.firefly.TmxTokenType.OFFSET);
						if (offset !== null) {
							offsetItem = offset.getChildren();
							offsetSize = offsetItem.size();
							for (n = 0; n < offsetSize; n++) {
								this.applyOffsetItem(tmxModel, offsetItem
										.get(n));
							}
						}
					},
					applyOffsetItem : function(tmxModel, tmxOffsetItem) {
						var fromToken = tmxOffsetItem
								.getChildByType(sap.firefly.TmxTokenType.OFFSET_FROM);
						var toToken = tmxOffsetItem
								.getChildByType(sap.firefly.TmxTokenType.OFFSET_TO);
						var rowAxis = tmxOffsetItem
								.getChildByType(sap.firefly.TmxTokenType.ROWS);
						var columnAxis = tmxOffsetItem
								.getChildByType(sap.firefly.TmxTokenType.COLUMNS);
						var queryManager;
						var fromValue;
						var toValue;
						if (((fromToken !== null) || (toToken !== null))
								&& ((rowAxis !== null) || (columnAxis !== null))) {
							queryManager = tmxModel.m_queryModel
									.getQueryManager();
							if (fromToken !== null) {
								fromValue = fromToken.getIntegerValue();
								if (rowAxis !== null) {
									queryManager.setOffsetRows(fromValue);
								} else {
									if (columnAxis !== null) {
										queryManager
												.setOffsetColumns(fromValue);
									}
								}
							}
							if (toToken !== null) {
								toValue = toToken.getIntegerValue();
								if (rowAxis !== null) {
									queryManager.setMaxRows(toValue);
								} else {
									if (columnAxis !== null) {
										queryManager.setMaxColumns(toValue);
									}
								}
							}
						}
					},
					applySortingFunction : function(tmxModel, token) {
						var firstChild = token.getFirstChild();
						var tokenElementList = firstChild
								.getChildByType(sap.firefly.TmxTokenType.SQUARE_BRACKETS);
						var type;
						var path;
						var sortingManager;
						var genericSorting;
						var sortinParameter;
						var sortingSize;
						var i;
						var currentToken;
						var currentTokenType;
						var currentParameterTokenList;
						var dimensionParameter;
						var dimensionParameterType;
						var dimensionName;
						var dimension;
						var measureParameterTokenList;
						var measureStructure;
						var measureList;
						var measureSize;
						var n;
						var currentMeasure;
						var currentMeasureType;
						if (tokenElementList === null) {
							this
									.addTmxErrorWithCode(
											"Missing elementlist",
											token,
											sap.firefly.ErrorCodes.TMX_INCOMPLETE_SYNTAX);
							return null;
						}
						type = firstChild.getType();
						path = sap.firefly.XList.create();
						sortingManager = tmxModel.m_queryModel
								.getSortingManager();
						genericSorting = null;
						sortinParameter = tokenElementList.getChildren();
						sortingSize = sortinParameter.size();
						for (i = 0; i < sortingSize; i++) {
							currentToken = sortinParameter.get(i);
							currentTokenType = currentToken.getType();
							if ((currentTokenType === sap.firefly.TmxTokenType.NAME)
									|| (currentTokenType === sap.firefly.TmxTokenType.IDENTIFIER)) {
								currentParameterTokenList = currentToken
										.getFirstChild();
								if ((currentParameterTokenList === null)
										|| currentParameterTokenList
												.getChildren().isEmpty()) {
									this
											.addTmxErrorWithCode(
													"No parameter given for dimension",
													currentToken,
													sap.firefly.ErrorCodes.TMX_INCOMPLETE_SYNTAX);
									return null;
								}
								dimensionParameter = currentParameterTokenList
										.getFirstChild();
								dimensionParameterType = dimensionParameter
										.getType();
								if ((dimensionParameterType !== sap.firefly.TmxTokenType.NUMBER)
										&& (dimensionParameterType !== sap.firefly.TmxTokenType.STRING)
										&& (dimensionParameterType !== sap.firefly.TmxTokenType.NAME)) {
									this
											.addTmxErrorWithCode(
													"Unexpected parameter given for dimension",
													currentToken,
													sap.firefly.ErrorCodes.TMX_UNEXPECTED_SYNTAX);
									return null;
								}
								dimensionName = currentToken.getName();
								dimension = tmxModel.m_queryModel
										.getDimensionByName(dimensionName);
								if (dimension === null) {
									this
											.addTmxErrorWithCode(
													"Dimension could not be found",
													currentToken,
													sap.firefly.ErrorCodes.INVALID_DIMENSION);
									return null;
								}
								path.add(sap.firefly.QFactory2
										.newDimensionElement(dimension
												.getKeyField(), null,
												dimensionParameter.toString()));
							} else {
								if (currentTokenType === sap.firefly.TmxTokenType.MEASURES) {
									measureParameterTokenList = currentToken
											.getFirstChild();
									if ((measureParameterTokenList === null)
											|| measureParameterTokenList
													.getChildren().isEmpty()) {
										this
												.addTmxErrorWithCode(
														"No parameter given for measures",
														currentToken,
														sap.firefly.ErrorCodes.TMX_INCOMPLETE_SYNTAX);
										return null;
									}
									measureStructure = tmxModel.m_queryModel
											.getMeasureDimension();
									measureList = measureParameterTokenList
											.getChildren();
									measureSize = measureList.size();
									for (n = 0; n < measureSize; n++) {
										currentMeasure = measureList.get(n);
										currentMeasureType = currentMeasure
												.getType();
										if ((currentMeasureType !== sap.firefly.TmxTokenType.IDENTIFIER)
												&& (currentMeasureType !== sap.firefly.TmxTokenType.NAME)) {
											this
													.addTmxErrorWithCode(
															"Unexpected parameter given for measure",
															currentToken,
															sap.firefly.ErrorCodes.TMX_UNEXPECTED_SYNTAX);
											return null;
										}
										path.add(sap.firefly.QFactory2
												.newDimensionElement(
														measureStructure
																.getKeyField(),
														null, currentMeasure
																.getName()));
									}
								} else {
									this
											.addTmxErrorWithCode(
													"Unexpected parameter",
													currentToken,
													sap.firefly.ErrorCodes.TMX_UNEXPECTED_SYNTAX);
									return null;
								}
							}
						}
						if (path.isEmpty()) {
							this.addTmxErrorWithCode("Wrong parameters",
									tokenElementList,
									sap.firefly.ErrorCodes.TMX_SYNTAX_ERROR);
							return null;
						}
						if (type === sap.firefly.TmxTokenType.DATACELL) {
							genericSorting = sortingManager.getDataCellSorting(
									path, true);
						} else {
							if (type === sap.firefly.TmxTokenType.COMPLEX) {
								genericSorting = sortingManager
										.getComplexSorting(path, true);
							}
						}
						return genericSorting;
					},
					applyOrderItem : function(tmxModel, tmxOrderItem) {
						var firstChild = tmxOrderItem.getFirstChild();
						var type = firstChild.getType();
						var dim = null;
						var name;
						var member = null;
						var field = null;
						var isMeasures = false;
						var isFunction = false;
						var subNameToken;
						var subNameType;
						var genericSorting;
						var dimSorting;
						var sortManager;
						var tmxDir;
						var dirType;
						var tmxBreak;
						if (type === sap.firefly.TmxTokenType.MEASURES) {
							name = "Measures";
							dim = tmxModel.m_queryModel.getMeasureDimension();
							isMeasures = true;
						} else {
							if (type
									.isTypeOf(sap.firefly.TmxTokenType.SORT_FUNCTION)) {
								isFunction = true;
								name = firstChild.getName();
							} else {
								name = firstChild.getName();
								dim = tmxModel.m_queryModel
										.getDimensionByName(name);
								if (dim === null) {
									member = tmxModel.m_queryModel
											.getMeasureDimension()
											.getDimensionMember(name, false);
									if (member === null) {
										field = tmxModel.m_queryModel
												.getFieldByName(name);
									}
								}
							}
						}
						subNameToken = firstChild.getSubNameToken();
						subNameType = null;
						if (subNameToken !== null) {
							subNameType = subNameToken.getType();
						}
						genericSorting = null;
						dimSorting = null;
						sortManager = tmxModel.m_queryModel.getSortingManager();
						if (dim !== null) {
							if (subNameType !== null) {
								if ((subNameType === sap.firefly.TmxTokenType.KEY)
										&& sortManager
												.supportsDimensionSorting(
														dim,
														sap.firefly.SortType.MEMBER_KEY)) {
									dimSorting = sortManager
											.getDimensionSorting(dim, true);
									genericSorting = dimSorting;
									dimSorting
											.setSortByPresentation(sap.firefly.PresentationType.KEY);
								} else {
									if ((subNameType === sap.firefly.TmxTokenType.TEXT)
											&& sortManager
													.supportsDimensionSorting(
															dim,
															sap.firefly.SortType.MEMBER_TEXT)) {
										dimSorting = sortManager
												.getDimensionSorting(dim, true);
										genericSorting = dimSorting;
										dimSorting
												.setSortByPresentation(sap.firefly.PresentationType.TEXT);
									} else {
										if ((subNameType === sap.firefly.TmxTokenType.HIERARCHY)
												&& sortManager
														.supportsDimensionSorting(
																dim,
																sap.firefly.SortType.HIERARCHY)) {
											dimSorting = sortManager
													.getDimensionSorting(dim,
															true);
											genericSorting = dimSorting;
											dimSorting.setSortByHierarchy();
										} else {
											if ((isMeasures)
													&& (subNameToken !== null)
													&& sortManager
															.supportsMeasureSorting()) {
												member = dim
														.getDimensionMember(
																subNameToken
																		.getName(),
																false);
												genericSorting = sortManager
														.getMeasureSorting(
																member, true);
											}
										}
									}
								}
							}
							if (genericSorting === null) {
								dimSorting = sortManager.getDimensionSorting(
										dim, true);
								dimSorting
										.setSortByPresentation(sap.firefly.PresentationType.KEY);
								genericSorting = dimSorting;
							}
						} else {
							if (member !== null) {
								genericSorting = sortManager.getMeasureSorting(
										member, true);
							} else {
								if (field !== null) {
									genericSorting = sortManager
											.getFieldSorting(field, true);
								} else {
									if (isFunction) {
										genericSorting = this
												.applySortingFunction(tmxModel,
														tmxOrderItem);
										if (genericSorting === null) {
											this
													.addApplyError(
															"Error while applying sorting function",
															tmxOrderItem);
											return;
										}
									} else {
										this
												.addParserErrorExt(
														"Dimension or measure not found: ",
														name,
														firstChild
																.getPosition(),
														sap.firefly.ErrorCodes.INVALID_DIMENSION);
										return;
									}
								}
							}
						}
						tmxDir = tmxOrderItem.getSecondChild();
						genericSorting
								.setDirection(sap.firefly.XSortDirection.ASCENDING);
						if (tmxDir !== null) {
							dirType = tmxDir.getType();
							if (dirType === sap.firefly.TmxTokenType.DESC) {
								genericSorting
										.setDirection(sap.firefly.XSortDirection.DESCENDING);
							} else {
								if (dirType === sap.firefly.TmxTokenType.FILTER) {
									if (dimSorting === null) {
										this
												.addParserErrorExt(
														"Sort by filter not allowed on measure",
														name,
														firstChild
																.getPosition(),
														sap.firefly.ErrorCodes.TMX_APPLY);
										return;
									}
									dimSorting.setSortByFilter();
								}
							}
							tmxBreak = tmxOrderItem.getThirdChild();
							if ((tmxBreak !== null)
									&& (tmxBreak.getType() === sap.firefly.TmxTokenType.BREAK)) {
								genericSorting.setPreserveGrouping(false);
							}
						}
					},
					applyMemberDefinition : function(tmxModel, tmxMembersDef) {
						var type = tmxMembersDef.getType();
						var structure = null;
						var roundBrackets;
						var children;
						var childrenSize;
						var i;
						var currentMemberDef;
						var leftSide;
						var rightSide;
						var memberName;
						var jsonAttributes;
						var text;
						var currentOp;
						var restrictedMeasure;
						var aggregationElement;
						var postAggregationElement;
						var propertyTokens;
						var tokenSize;
						var n;
						var filterElement;
						var formulaMeasure;
						var rootFormulaItem;
						if (type === sap.firefly.TmxTokenType.MEASURES) {
							structure = tmxModel.m_queryModel
									.getMeasureDimension();
						}
						if (structure === null) {
							this
									.addApplyError(
											"Member definition only possible for structure",
											tmxMembersDef);
							return;
						}
						roundBrackets = tmxMembersDef.getMainChild();
						children = roundBrackets.getChildren();
						childrenSize = children.size();
						for (i = 0; i < childrenSize; i++) {
							currentMemberDef = children.get(i);
							leftSide = currentMemberDef.getLeftSide();
							rightSide = currentMemberDef.getRightSide();
							memberName = leftSide.getName();
							jsonAttributes = leftSide.getJsonAttributes();
							text = memberName;
							if (jsonAttributes !== null) {
								text = jsonAttributes
										.getStringByNameWithDefault("text",
												text);
							}
							currentOp = currentMemberDef.getType()
									.getOperator();
							if (currentOp === sap.firefly.AssignOperator.ASSIGN_DEF) {
								restrictedMeasure = structure
										.addNewRestrictedMeasure(memberName,
												text);
								if (jsonAttributes !== null) {
									aggregationElement = jsonAttributes
											.getElementByName("preAggregation");
									if ((aggregationElement !== null)
											&& aggregationElement.isStructure()) {
										this.applyAggregation(tmxModel,
												memberName, aggregationElement
														.asStructure(), false);
									}
									postAggregationElement = jsonAttributes
											.getElementByName("postAggregation");
									if ((postAggregationElement !== null)
											&& postAggregationElement
													.isStructure()) {
										this.applyAggregation(tmxModel,
												memberName,
												postAggregationElement
														.asStructure(), true);
									}
								}
								propertyTokens = rightSide
										.searchNeighborTokensByType(sap.firefly.TmxTokenType.OP_ASSIGN_PROP);
								if (propertyTokens !== null) {
									rightSide = sap.firefly.TmxToken
											.removeNeighborToken(
													sap.firefly.TmxTokenType.OP_ASSIGN_PROP,
													rightSide);
									tokenSize = propertyTokens.size();
									for (n = 0; n < tokenSize; n++) {
										this.applyProperty(tmxModel,
												propertyTokens.get(n),
												memberName);
									}
								}
								filterElement = this.applyFilter(tmxModel,
										rightSide);
								if (filterElement !== null) {
									restrictedMeasure.getFilter()
											.setComplexSelection(filterElement);
								}
							} else {
								if (currentOp === sap.firefly.AssignOperator.ASSIGN) {
									formulaMeasure = structure
											.addNewFormulaMeasure(memberName,
													text);
									rootFormulaItem = this.applyFormulaItem(
											tmxModel, rightSide);
									if (rootFormulaItem === null) {
										return;
									}
									formulaMeasure.setFormula(rootFormulaItem);
								}
							}
						}
					},
					applyFormulaItem : function(tmxModel, tmxFormulaItem) {
						var type = tmxFormulaItem.getType();
						var theOp;
						var formulaOperation;
						var left;
						var right;
						var formulaFunction;
						var parameters;
						var paramSize;
						var i;
						var item;
						var parsedToken;
						var formulaConstant;
						var valueType;
						var value;
						var currency;
						var unitValue;
						var unit;
						var formulaMember;
						var name;
						if (type.isTypeOf(sap.firefly.TmxTokenType.OPERATOR)) {
							theOp = type.getOperator();
							if (theOp.isTypeOf(sap.firefly.Operator._MATH)
									|| theOp
											.isTypeOf(sap.firefly.Operator._COMPARISON)
									|| theOp
											.isTypeOf(sap.firefly.Operator._LOGICAL)) {
								formulaOperation = sap.firefly.QFactory2
										.newFormulaOperation(tmxModel
												.getContext());
								formulaOperation.setOperator(theOp);
								left = this.applyFormulaItem(tmxModel,
										tmxFormulaItem.getLeftSide());
								right = this.applyFormulaItem(tmxModel,
										tmxFormulaItem.getRightSide());
								if ((left === null) || (right === null)) {
									return null;
								}
								formulaOperation.setLeftSide(left);
								formulaOperation.setRightSide(right);
								return formulaOperation;
							}
							this.addError(
									sap.firefly.ErrorCodes.INVALID_OPERATOR,
									sap.firefly.XString.concatenate2(
											"Operator not supported: ", theOp
													.getName()));
							return null;
						}
						if (type.isTypeOf(sap.firefly.TmxTokenType.FUNCTION)) {
							formulaFunction = sap.firefly.QFactory2
									.newFormulaFunction(tmxModel.getContext());
							formulaFunction.setFunctionName(tmxFormulaItem
									.getName());
							parameters = tmxFormulaItem.getFirstChild()
									.getChildren();
							paramSize = parameters.size();
							for (i = 0; i < paramSize; i++) {
								item = this.applyFormulaItem(tmxModel,
										parameters.get(i));
								if (item === null) {
									return null;
								}
								formulaFunction.add(item);
							}
							return formulaFunction;
						}
						if (type
								.isTypeOf(sap.firefly.TmxTokenType.TMX_FUNCTION)) {
							parsedToken = this.applyTmxFunction(tmxFormulaItem);
							if (parsedToken === null) {
								return null;
							}
							return this.applyFormulaItem(tmxModel, parsedToken);
						}
						formulaConstant = sap.firefly.QFactory2
								.newFormulaConstant(tmxModel.getContext());
						if (type.isTypeOf(sap.firefly.TmxTokenType.NUMBER)) {
							valueType = tmxFormulaItem.getValueType();
							if (valueType === sap.firefly.XValueType.INTEGER) {
								formulaConstant.setIntegerValue(tmxFormulaItem
										.getIntegerValue());
								return formulaConstant;
							}
							this.addError(
									sap.firefly.ErrorCodes.INVALID_DATATYPE,
									sap.firefly.XString.concatenate2(
											"Number type not supported: ",
											valueType.getName()));
							return null;
						} else {
							if (type === sap.firefly.TmxTokenType.CURRENCY) {
								value = tmxFormulaItem.getValue();
								if (value.getValueType() === sap.firefly.XValueType.INTEGER) {
									formulaConstant.setIntegerValue((value)
											.getIntegerValue());
								} else {
									if (value.getValueType() === sap.firefly.XValueType.DOUBLE) {
										formulaConstant.setDoubleValue((value)
												.getDoubleValue());
									}
								}
								currency = tmxFormulaItem
										.getPropertyValueBag()
										.getByKey(
												sap.firefly.TmxTokenType.CURRENCY
														.getName());
								formulaConstant.setCurrency(currency);
								return formulaConstant;
							} else {
								if (type === sap.firefly.TmxTokenType.UNIT) {
									unitValue = tmxFormulaItem.getValue();
									if (unitValue.getValueType() === sap.firefly.XValueType.INTEGER) {
										formulaConstant
												.setIntegerValue((unitValue)
														.getIntegerValue());
									} else {
										if (unitValue.getValueType() === sap.firefly.XValueType.DOUBLE) {
											formulaConstant
													.setDoubleValue((unitValue)
															.getDoubleValue());
										}
									}
									unit = tmxFormulaItem
											.getPropertyValueBag()
											.getByKey(
													sap.firefly.TmxTokenType.UNIT
															.getName());
									formulaConstant.setUnit(unit);
									return formulaConstant;
								} else {
									if ((type === sap.firefly.TmxTokenType.DATE)
											|| (type === sap.firefly.TmxTokenType.DATETIME)) {
										return formulaConstant;
									} else {
										if ((type === sap.firefly.TmxTokenType.NAME)
												|| (type === sap.firefly.TmxTokenType.IDENTIFIER)
												|| (type === sap.firefly.TmxTokenType.CONDITION)) {
											formulaMember = sap.firefly.QFactory2
													.newFormulaMember(tmxModel
															.getContext());
											name = tmxFormulaItem.getName();
											formulaMember.setMemberName(name);
											return formulaMember;
										} else {
											if ((type === sap.firefly.TmxTokenType.STRING)) {
												formulaConstant
														.setStringValue(tmxFormulaItem
																.getStringValue());
												return formulaConstant;
											} else {
												if ((type === sap.firefly.TmxTokenType._TRUE)
														|| (type === sap.firefly.TmxTokenType._FALSE)) {
													formulaConstant
															.setBooleanValue(sap.firefly.XBoolean
																	.convertStringToBoolean(tmxFormulaItem
																			.getName()));
													return formulaConstant;
												} else {
													if (type === sap.firefly.TmxTokenType.ROUND_BRACKETS) {
														return this
																.applyFormulaItem(
																		tmxModel,
																		tmxFormulaItem
																				.getFirstChild());
													}
												}
											}
										}
									}
								}
							}
						}
						return null;
					},
					applyResultstructureDefinition : function(tmxModel,
							resultstructureDefinition, dimension) {
						var children;
						var firstIndex;
						var lastIndex;
						var lastChild;
						var totalAlignment;
						var firstChild;
						var indexOfAll;
						var singleValueFilter;
						var childrenSize;
						var fe;
						var memberToken;
						var resultSetSorting;
						if ((tmxModel !== null)
								&& (resultstructureDefinition !== null)
								&& (dimension !== null)) {
							children = resultstructureDefinition.getChildren();
							if (children.isEmpty()) {
								tmxModel.clearFilter(dimension.getName());
							} else {
								firstIndex = 0;
								lastIndex = resultstructureDefinition
										.getChildren().size() - 1;
								lastChild = null;
								if (firstIndex !== lastIndex) {
									lastChild = resultstructureDefinition
											.getChildren().get(lastIndex);
								}
								totalAlignment = null;
								firstChild = resultstructureDefinition
										.getChildren().get(firstIndex);
								if (firstChild.getType() === sap.firefly.TmxTokenType.TOTAL) {
									totalAlignment = sap.firefly.ResultAlignment.TOP;
								}
								if ((lastChild !== null)
										&& (lastChild.getType() === sap.firefly.TmxTokenType.TOTAL)) {
									if (firstChild.getType() === sap.firefly.TmxTokenType.TOTAL) {
										totalAlignment = sap.firefly.ResultAlignment.TOPBOTTOM;
									} else {
										totalAlignment = sap.firefly.ResultAlignment.BOTTOM;
									}
								}
								if (totalAlignment !== null) {
									tmxModel.addTotals(dimension,
											totalAlignment);
								}
								indexOfAll = resultstructureDefinition
										.getIndexOfChildByType(sap.firefly.TmxTokenType.ALL);
								if (indexOfAll === -1) {
									singleValueFilter = sap.firefly.XListOfString
											.create();
									childrenSize = children.size();
									for (fe = 0; fe < childrenSize; fe++) {
										memberToken = children.get(fe);
										if ((memberToken.getType() !== sap.firefly.TmxTokenType.ALL)
												&& (memberToken.getType() !== sap.firefly.TmxTokenType.TOTAL)) {
											singleValueFilter.add(memberToken
													.getName());
										}
									}
									tmxModel.addMultipleMembersFilter(dimension
											.getKeyField(), singleValueFilter);
								}
							}
							resultSetSorting = dimension.getResultSetSorting();
							if (resultSetSorting.supportsSortByFilter()) {
								resultSetSorting.setSortByFilter();
							}
						}
					},
					applyMakeDateOrDateTimeISOOrSAP : function(token,
							tokenType, stringParameter) {
						var sapOrISO;
						var newToken;
						if (stringParameter === null) {
							sapOrISO = sap.firefly.XStringUtils.concatenate3(
									". Expected: ", tokenType.getName(),
									"( STRING )");
							return this.addTmxFunctionParamError(
									sap.firefly.XStringUtils.concatenate3(
											"Wrong parameters for function ",
											tokenType.toString(), sapOrISO),
									token);
						}
						newToken = sap.firefly.TmxToken.createTokenByType(
								sap.firefly.TmxTokenType.DATE, 0);
						if (tokenType === sap.firefly.TmxTokenType.MAKEDATE) {
							newToken.setDateValue(sap.firefly.XDate
									.createDateFromIsoFormat(stringParameter
											.getStringValue()));
						} else {
							if (tokenType === sap.firefly.TmxTokenType.MAKEDATE_SAP) {
								newToken
										.setDateValue(sap.firefly.XDate
												.createDateFromSAPFormat(stringParameter
														.getStringValue()));
							} else {
								if (tokenType === sap.firefly.TmxTokenType.MAKEDATETIME) {
									newToken
											.setDateTimeValue(sap.firefly.XDateTime
													.createDateTimeFromIsoFormat(stringParameter
															.getStringValue()));
								} else {
									if (tokenType === sap.firefly.TmxTokenType.MAKEDATETIME_SAP) {
										newToken
												.setDateTimeValue(sap.firefly.XDateTime
														.createDateTimeFromSAPFormat(stringParameter
																.getStringValue()));
									}
								}
							}
						}
						return newToken;
					},
					applyDayMonthAndYearOfDate : function(token, tokenType,
							dateParameter, dateTimeParameter) {
						var newToken = sap.firefly.TmxToken.createTokenByType(
								sap.firefly.TmxTokenType.NUMBER, 0);
						var dateValue = null;
						var expectation;
						var value;
						var dQuarterOfYear;
						if (dateParameter !== null) {
							dateValue = dateParameter.getDateValue();
						} else {
							if (dateTimeParameter !== null) {
								dateValue = dateTimeParameter
										.getDateTimeValue();
							}
						}
						if (dateValue === null) {
							expectation = sap.firefly.XStringUtils
									.concatenate3(". Expected: ", tokenType
											.toString(), "( DATETIME )");
							return this.addTmxFunctionParamError(
									sap.firefly.XStringUtils.concatenate3(
											"Wrong parameters for function ",
											tokenType.toString(), expectation),
									token);
						}
						value = -1;
						if (tokenType === sap.firefly.TmxTokenType.DAYOFDATE) {
							value = dateValue.getDayOfMonth();
						} else {
							if (tokenType === sap.firefly.TmxTokenType.YEAROFDATE) {
								value = dateValue.getYear();
							} else {
								if (tokenType === sap.firefly.TmxTokenType.MONTHOFDATE) {
									value = dateValue.getMonthOfYear();
								} else {
									if (tokenType === sap.firefly.TmxTokenType.QUARTEROFDATE) {
										dQuarterOfYear = ((dateValue
												.getMonthOfYear() - 1) / 3) + 1;
										value = sap.firefly.XDouble
												.convertDoubleToInt(dQuarterOfYear);
									}
								}
							}
						}
						newToken.setIntegerValue(value);
						return newToken;
					},
					applyUpperOrLowerCase : function(token, tokenType,
							stringParameter) {
						var upOrLow;
						var newToken;
						var upOrLowCase;
						if (stringParameter === null) {
							upOrLow = sap.firefly.XStringUtils.concatenate3(
									". Expected: ", tokenType.getName(),
									"( STRING )");
							return this.addTmxFunctionParamError(
									sap.firefly.XStringUtils.concatenate3(
											"Wrong parameters for function ",
											tokenType.toString(), upOrLow),
									token);
						}
						newToken = sap.firefly.TmxToken.createTokenByType(
								sap.firefly.TmxTokenType.STRING, 0);
						upOrLowCase = null;
						if (tokenType === sap.firefly.TmxTokenType.UCASE) {
							upOrLowCase = sap.firefly.XString
									.convertToUpperCase(stringParameter
											.getStringValue());
						} else {
							if (tokenType === sap.firefly.TmxTokenType.LCASE) {
								upOrLowCase = sap.firefly.XString
										.convertToLowerCase(stringParameter
												.getStringValue());
							}
						}
						newToken.setStringValue(upOrLowCase);
						return newToken;
					},
					applyReplace : function(token, tokenType, parameter) {
						var children = parameter.getChildren();
						var value;
						var searchPattern;
						var replaceValue;
						var newToken;
						if (children.size() >= 3) {
							value = children.get(0).getStringValue();
							searchPattern = children.get(1).getStringValue();
							replaceValue = children.get(2).getStringValue();
							if (sap.firefly.XStringUtils.isNullOrEmpty(value)
									|| sap.firefly.XStringUtils
											.isNullOrEmpty(searchPattern)
									|| (replaceValue === null)) {
								return this
										.addTmxFunctionParamError(
												sap.firefly.XStringUtils
														.concatenate3(
																"Wrong parameters for function ",
																tokenType
																		.toString(),
																". Expected: ~replace( STRING, STRING, STRING )"),
												token);
							}
							newToken = sap.firefly.TmxToken.createTokenByType(
									sap.firefly.TmxTokenType.STRING, 0);
							newToken
									.setStringValue(sap.firefly.XString
											.replace(value, searchPattern,
													replaceValue));
							return newToken;
						}
						return null;
					},
					applyMakeCurrency : function(token, tokenType,
							numberParameter, stringParameter) {
						var number;
						var string;
						var newType;
						var newToken;
						if ((numberParameter === null)
								|| (stringParameter === null)) {
							return this
									.addTmxFunctionParamError(
											sap.firefly.XStringUtils
													.concatenate3(
															"Wrong parameters for function ",
															tokenType
																	.toString(),
															". Expected: ~replace( STRING, STRING, STRING )"),
											token);
						}
						number = numberParameter.getValue();
						string = stringParameter.getStringValue();
						if ((number === null)
								|| sap.firefly.XStringUtils
										.isNullOrEmpty(string)) {
							return this
									.addTmxFunctionParamError(
											sap.firefly.XStringUtils
													.concatenate3(
															"Unexpected parameters for function ",
															tokenType
																	.toString(),
															". Expected: ~replace( STRING, STRING, STRING )"),
											token);
						}
						if (tokenType === sap.firefly.TmxTokenType.MAKECURRENCY) {
							newType = sap.firefly.TmxTokenType.CURRENCY;
						} else {
							newType = sap.firefly.TmxTokenType.UNIT;
						}
						newToken = sap.firefly.TmxToken.createTokenByType(
								newType, 0);
						newToken.getPropertyValueBag().put(newType.getName(),
								string);
						if (number.getValueType() === sap.firefly.XValueType.INTEGER) {
							newToken
									.setIntegerValue((number).getIntegerValue());
						} else {
							if (number.getValueType() === sap.firefly.XValueType.DOUBLE) {
								newToken.setDoubleValue((number)
										.getDoubleValue());
							}
						}
						return newToken;
					},
					applyTmxFunction : function(token) {
						var tokenType;
						var parameterToken;
						var children;
						var parameter;
						var childrenSize;
						var i;
						var childToken;
						var parsedChildToken;
						var newToken;
						var stringParameter;
						var dateTimeParameter;
						var dateParameter;
						var numberParameter;
						if (token === null) {
							return null;
						}
						tokenType = token.getType();
						parameterToken = token
								.getChildByType(sap.firefly.TmxTokenType.ROUND_BRACKETS_LIST);
						if ((parameterToken === null)
								|| (tokenType
										.isTypeOf(sap.firefly.TmxTokenType.TMX_FUNCTION) === false)) {
							return null;
						}
						children = parameterToken.getChildren();
						if (children === null) {
							return null;
						}
						parameter = sap.firefly.TmxToken
								.createTokenByType(
										sap.firefly.TmxTokenType.ROUND_BRACKETS_LIST,
										0);
						childrenSize = children.size();
						for (i = 0; i < childrenSize; i++) {
							childToken = children.get(i);
							if (childToken.getType().isTypeOf(
									sap.firefly.TmxTokenType.TMX_FUNCTION)) {
								parsedChildToken = this
										.applyTmxFunction(childToken);
								if (parsedChildToken === null) {
									return null;
								}
								parameter.addChild(parsedChildToken);
							} else {
								parameter.addChild(childToken);
							}
						}
						if (tokenType === sap.firefly.TmxTokenType.NOW) {
							newToken = sap.firefly.TmxToken.createTokenByType(
									sap.firefly.TmxTokenType.DATETIME, 0);
							newToken.setDateTimeValue(sap.firefly.XDateTime
									.createCurrentLocalDateTime());
							return newToken;
						}
						stringParameter = parameter
								.getChildByType(sap.firefly.TmxTokenType.STRING);
						if ((tokenType === sap.firefly.TmxTokenType.MAKEDATE)
								|| (tokenType === sap.firefly.TmxTokenType.MAKEDATE_SAP)
								|| (tokenType === sap.firefly.TmxTokenType.MAKEDATETIME)
								|| (tokenType === sap.firefly.TmxTokenType.MAKEDATETIME_SAP)) {
							return this.applyMakeDateOrDateTimeISOOrSAP(token,
									tokenType, stringParameter);
						}
						dateTimeParameter = parameter
								.getChildByType(sap.firefly.TmxTokenType.DATETIME);
						dateParameter = parameter
								.getChildByType(sap.firefly.TmxTokenType.DATE);
						if ((tokenType === sap.firefly.TmxTokenType.DAYOFDATE)
								|| (tokenType === sap.firefly.TmxTokenType.YEAROFDATE)
								|| (tokenType === sap.firefly.TmxTokenType.MONTHOFDATE)
								|| (tokenType === sap.firefly.TmxTokenType.QUARTEROFDATE)) {
							return this
									.applyDayMonthAndYearOfDate(token,
											tokenType, dateParameter,
											dateTimeParameter);
						}
						if ((tokenType === sap.firefly.TmxTokenType.UCASE)
								|| (tokenType === sap.firefly.TmxTokenType.LCASE)) {
							return this.applyUpperOrLowerCase(token, tokenType,
									stringParameter);
						}
						if (tokenType === sap.firefly.TmxTokenType.REPLACE) {
							return this.applyReplace(token, tokenType,
									parameter);
						}
						if ((tokenType === sap.firefly.TmxTokenType.MAKECURRENCY)
								|| (tokenType === sap.firefly.TmxTokenType.MAKEUNIT)) {
							numberParameter = parameter
									.getChildByType(sap.firefly.TmxTokenType.NUMBER);
							return this.applyMakeCurrency(token, tokenType,
									numberParameter, stringParameter);
						}
						return null;
					},
					applyAxis : function(tmxModel, tmxAxis, axisType) {
						var axis = tmxModel.m_queryModel.getAxis(axisType);
						var axisElements;
						var axisSize;
						var i;
						var axisElement;
						var dimension;
						var name;
						var filterSortBySelection;
						if (axisType.isVisible()) {
							axis.clear();
						}
						if (tmxAxis !== null) {
							axisElements = tmxAxis.getChildren();
							axisSize = axisElements.size();
							for (i = 0; i < axisSize; i++) {
								axisElement = axisElements.get(i);
								if (axisElement.getType() === sap.firefly.TmxTokenType.MEASURES) {
									dimension = tmxModel.m_queryModel
											.getMeasureDimension();
									name = "Measure";
								} else {
									if (axisElement.getType() === sap.firefly.TmxTokenType.ACCOUNT) {
										dimension = tmxModel.m_queryModel
												.getDimensionByType(sap.firefly.DimensionType.ACCOUNT);
										name = "Account";
									} else {
										if (axisElement.getType() === sap.firefly.TmxTokenType.VERSION) {
											dimension = tmxModel.m_queryModel
													.getDimensionByType(sap.firefly.DimensionType.VERSION);
											name = "Version";
										} else {
											name = axisElement.getName();
											dimension = tmxModel.m_queryModel
													.getDimensionByName(name);
										}
									}
								}
								if (dimension === null) {
									this
											.addError(
													sap.firefly.ErrorCodes.INVALID_DIMENSION,
													sap.firefly.XString
															.concatenate2(
																	"Dimension not in model: ",
																	name));
									return;
								}
								axis.add(dimension);
								this.applyDimJsonProperties(dimension,
										axisElement.getJsonAttributes(),
										axisElement);
								filterSortBySelection = axisElement
										.getChildByType(sap.firefly.TmxTokenType.SQUARE_BRACKETS);
								if (filterSortBySelection !== null) {
									this.applyResultstructureDefinition(
											tmxModel, filterSortBySelection,
											dimension);
								}
							}
						}
					},
					getAggregationType : function(typeString) {
						var type;
						var aggType;
						if (sap.firefly.XStringUtils
								.isNotNullAndNotEmpty(typeString)) {
							type = sap.firefly.XString
									.convertToUpperCase(typeString);
							if (sap.firefly.XString.isEqual(type, "AVG")) {
								return sap.firefly.AggregationType.AVERAGE;
							}
							if (sap.firefly.XString.isEqual(type,
									"DISTINCTCOUNT")) {
								return sap.firefly.AggregationType.COUNT;
							}
							aggType = sap.firefly.AggregationType.lookup(type);
							if (aggType !== null) {
								return aggType;
							}
							this.addApplyError("Unknown aggregation type",
									sap.firefly.TmxToken.createToken(type,
											sap.firefly.TmxTokenType.OPERATOR,
											0));
						}
						return null;
					},
					applyDimJsonProperties : function(dimension,
							jsonProperties, source) {
						var initialDrillLevel;
						var showElement;
						var resultSetFields;
						var presentationType;
						var showList;
						var showSize;
						var k;
						var readModeString;
						var readMode;
						var removeMembers;
						var removeMembersList;
						var removeSize;
						var mi;
						var measureName;
						if (jsonProperties === null) {
							return;
						}
						if (jsonProperties.hasValueByName("hierarchy")) {
							dimension.activateHierarchy(jsonProperties
									.getStringByName("hierarchy"), null, null);
						}
						if (jsonProperties.hasValueByName("isHierarchyActive")) {
							dimension.setHierarchyActive(jsonProperties
									.getBooleanByName("isHierarchyActive"));
						}
						initialDrillLevel = jsonProperties
								.getIntegerByNameWithDefault(
										"initialDrillLevel", -2);
						if (initialDrillLevel !== -2) {
							dimension.setInitialDrillLevel(initialDrillLevel);
						}
						showElement = jsonProperties.getElementByName("show");
						if (showElement !== null) {
							if (dimension.getFieldLayoutType() === sap.firefly.FieldLayoutType.FIELD_BASED) {
								resultSetFields = dimension
										.getResultSetFields();
							} else {
								resultSetFields = dimension.getMainAttribute()
										.getResultSetFields();
							}
							resultSetFields.clear();
							if (showElement.getType() === sap.firefly.PrElementType.LIST) {
								showList = showElement.asList();
								showSize = showList.size();
								for (k = 0; k < showSize; k++) {
									presentationType = showList
											.getStringByIndex(k);
									if (sap.firefly.TmxParser
											.addPresentationType(
													presentationType,
													resultSetFields, dimension) === false) {
										this.addField(presentationType,
												resultSetFields, dimension);
									}
								}
							} else {
								if (showElement.getType() === sap.firefly.PrElementType.STRING) {
									presentationType = showElement.asString()
											.getStringValue();
									if (sap.firefly.TmxParser
											.addPresentationType(
													presentationType,
													resultSetFields, dimension) === false) {
										this.addField(presentationType,
												resultSetFields, dimension);
									}
								}
							}
						}
						if (jsonProperties.hasValueByName("readMode")) {
							readModeString = jsonProperties
									.getStringByName("readMode");
							if (sap.firefly.XStringUtils
									.isNotNullAndNotEmpty(readModeString)) {
								readMode = sap.firefly.QMemberReadMode
										.lookupCaseInsensitive(readModeString);
								if (readMode === null) {
									this
											.addTmxErrorWithCode(
													"Unknown ReadMode",
													source,
													sap.firefly.ErrorCodes.TMX_UNSUPPORTED_ACTION);
								} else {
									if (dimension
											.supportsReadMode(
													sap.firefly.QContextType.RESULT_SET,
													readMode)) {
										dimension
												.setReadMode(
														sap.firefly.QContextType.RESULT_SET,
														readMode);
									} else {
										this
												.addTmxErrorWithCode(
														"This ReadMode is not supported by the dimension",
														source,
														sap.firefly.ErrorCodes.TMX_UNSUPPORTED_ACTION);
									}
								}
							} else {
								this
										.addTmxErrorWithCode(
												"ReadMode is missing",
												source,
												sap.firefly.ErrorCodes.TMX_INCOMPLETE_SYNTAX);
							}
						}
						if (dimension.isStructure()) {
							removeMembers = jsonProperties
									.getElementByName("removeMembers");
							if ((removeMembers !== null)
									&& (removeMembers.getType() === sap.firefly.PrElementType.LIST)) {
								removeMembersList = removeMembers.asList();
								removeSize = removeMembersList.size();
								for (mi = 0; mi < removeSize; mi++) {
									measureName = removeMembersList
											.getStringByIndexWithDefault(mi,
													null);
									if (measureName !== null) {
										dimension.removeMeasure(measureName);
									}
								}
							}
						}
					},
					addField : function(fieldName, resultSetFields, dimension) {
						var fieldByName = dimension.getFieldByName(fieldName);
						var message;
						if (fieldByName === null) {
							message = sap.firefly.XStringUtils.concatenate5(
									"The field or presentation '", fieldName,
									"' could not be found for the dimension '",
									dimension.getName(), "'!");
							this.addErrorExt(
									sap.firefly.OriginLayer.APPLICATION,
									sap.firefly.ErrorCodes.INVALID_TOKEN,
									message, null);
							return;
						}
						resultSetFields.add(fieldByName);
					},
					applyProperty : function(tmxModel, token, targetMember) {
						return;
					},
					applyAggregation : function(tmxModel, targetMember,
							aggregation, post) {
						var typeElement = aggregation.getElementByName("type");
						var dimensions;
						var dimensionsElement;
						var dimensionsList;
						var dimensionSize;
						var i;
						var currentMemberElement;
						var aggregationType;
						if ((typeElement !== null) && typeElement.isString()) {
							dimensions = sap.firefly.XListOfString.create();
							dimensionsElement = aggregation
									.getElementByName("dimensions");
							if (dimensionsElement !== null) {
								if (dimensionsElement.isList()) {
									dimensionsList = dimensionsElement;
									dimensionSize = dimensionsList.size();
									for (i = 0; i < dimensionSize; i++) {
										currentMemberElement = dimensionsList
												.getElementByIndex(i);
										if (currentMemberElement.isString()) {
											dimensions.add(currentMemberElement
													.asString()
													.getStringValue());
										}
									}
								} else {
									if (dimensionsElement.isString()) {
										dimensions.add(dimensionsElement
												.asString().getStringValue());
									}
								}
							}
							aggregationType = this
									.getAggregationType(typeElement.asString()
											.getStringValue());
							if (post === false) {
								tmxModel.createAggregation(targetMember,
										targetMember, aggregationType,
										dimensions, null, null);
							} else {
								tmxModel.createAggregation(targetMember,
										targetMember, null, null,
										aggregationType, dimensions);
							}
						}
					},
					applyFilter : function(tmxModel, expr) {
						var type = expr.getType();
						var rightSide;
						var leftSide;
						var leftSideType;
						var theOperator;
						var leftSideComponent;
						var rightSideComponent;
						var logicalOp;
						var dimension;
						var dimName;
						var jsonAttributes;
						var comparisonOperator;
						var filterList;
						var newFilterListOr;
						var filterSize;
						var i;
						var newFilterElement;
						var mainChild;
						if (type.isTypeOf(sap.firefly.TmxTokenType.OPERATOR)) {
							rightSide = expr.getRightSide();
							if (rightSide.getType().isTypeOf(
									sap.firefly.TmxTokenType.TMX_FUNCTION)) {
								rightSide = this.applyTmxFunction(rightSide);
								if (rightSide === null) {
									return null;
								}
							}
							leftSide = expr.getLeftSide();
							theOperator = expr.getType().getOperator();
							if (theOperator
									.isTypeOf(sap.firefly.Operator._LOGICAL)) {
								leftSideComponent = this.applyFilter(tmxModel,
										leftSide);
								if (leftSideComponent === null) {
									return null;
								}
								rightSideComponent = this.applyFilter(tmxModel,
										rightSide);
								if (rightSideComponent === null) {
									return null;
								}
								if (theOperator === sap.firefly.LogicalBoolOperator.AND) {
									logicalOp = sap.firefly.QFactory2
											.newFilterAnd(tmxModel.getContext());
								} else {
									logicalOp = sap.firefly.QFactory2
											.newFilterOr(tmxModel.getContext());
								}
								logicalOp.add(leftSideComponent);
								logicalOp.add(rightSideComponent);
								return logicalOp;
							}
							if (theOperator
									.isTypeOf(sap.firefly.Operator._COMPARISON)) {
								leftSideType = leftSide.getType();
								if (leftSideType === sap.firefly.TmxTokenType.MEASURES) {
									dimension = tmxModel.m_queryModel
											.getMeasureDimension();
								} else {
									if (leftSideType === sap.firefly.TmxTokenType.NAME) {
										dimName = leftSide.getName();
										dimension = tmxModel.m_queryModel
												.getDimensionByName(dimName);
									} else {
										if (leftSideType === sap.firefly.TmxTokenType.IDENTIFIER) {
											dimName = leftSide.getStringValue();
											dimension = tmxModel.m_queryModel
													.getDimensionByName(dimName);
										} else {
											this
													.addParserError("Left side must be name of dimension");
											return null;
										}
									}
									if (dimension === null) {
										this
												.addParserError(sap.firefly.XString
														.concatenate2(
																"Dimension not available: ",
																dimName));
										return null;
									}
								}
								jsonAttributes = leftSide.getJsonAttributes();
								this.applyDimJsonProperties(dimension,
										jsonAttributes, leftSide);
								comparisonOperator = theOperator;
								if (comparisonOperator === sap.firefly.ComparisonOperator.IN) {
									filterList = rightSide.getChildren();
									newFilterListOr = sap.firefly.QFactory2
											.newFilterOr(tmxModel.getContext());
									comparisonOperator = sap.firefly.ComparisonOperator.EQUAL;
									if ((expr.getCondition() !== null)
											&& (expr.getCondition().getType() === sap.firefly.TmxTokenType.NOT)) {
										comparisonOperator = sap.firefly.ComparisonOperator.NOT_EQUAL;
										newFilterListOr = sap.firefly.QFactory2
												.newFilterAnd(tmxModel
														.getContext());
									}
									filterSize = filterList.size();
									for (i = 0; i < filterSize; i++) {
										newFilterElement = sap.firefly.TmxParser
												.addFilterOperation(
														comparisonOperator,
														dimension, filterList
																.get(i));
										if (newFilterElement === null) {
											return null;
										}
										newFilterListOr.add(newFilterElement);
									}
									return newFilterListOr;
								}
								return sap.firefly.TmxParser
										.addFilterOperation(comparisonOperator,
												dimension, rightSide);
							}
						} else {
							if (type === sap.firefly.TmxTokenType.ROUND_BRACKETS) {
								mainChild = expr.getMainChild();
								return this.applyFilter(tmxModel, mainChild);
							}
						}
						return null;
					},
					transformRoot : function() {
						var newRootToken = sap.firefly.TmxToken
								.createTokenByType(
										sap.firefly.TmxTokenType.ROOT, 0);
						var rootChildren = this.m_rootToken.getChildren();
						var currentSubToken = null;
						var childrenSize = rootChildren.size();
						var i;
						var tmxToken;
						var type;
						var newChildrenSize;
						var j;
						var tmxToken2;
						var resultToken;
						for (i = 0; i < childrenSize; i++) {
							tmxToken = rootChildren.get(i);
							type = tmxToken.getType();
							if (currentSubToken === null) {
								if (type
										.isTypeOf(sap.firefly.TmxTokenType.BLOCK_KEYWORD)) {
									currentSubToken = sap.firefly.TmxToken
											.createTokenByType(
													sap.firefly.TmxTokenType.QUERY,
													tmxToken.getPosition());
								} else {
									currentSubToken = sap.firefly.TmxToken
											.createTokenByType(
													sap.firefly.TmxTokenType.LANGUAGE,
													tmxToken.getPosition());
								}
								newRootToken.addChild(currentSubToken);
								currentSubToken.addChild(tmxToken);
							} else {
								if (type === sap.firefly.TmxTokenType.EXPRESSION_SEPARATOR) {
									currentSubToken = null;
								} else {
									currentSubToken.addChild(tmxToken);
								}
							}
						}
						rootChildren = newRootToken.getChildren();
						newChildrenSize = rootChildren.size();
						for (j = 0; j < newChildrenSize; j++) {
							tmxToken2 = rootChildren.get(j);
							if (tmxToken2.getType() === sap.firefly.TmxTokenType.QUERY) {
								resultToken = this.transformQuery(tmxToken2);
							} else {
								resultToken = this.transformLangExpr(tmxToken2);
							}
							if (resultToken === null) {
								return;
							}
							rootChildren.set(j, resultToken);
						}
						this.m_rootToken = newRootToken;
					},
					transformLangExpr : function(query) {
						var children = this.transformCanonicals(query
								.getChildren());
						var newLangToken;
						var childrenSize;
						var i;
						if (children === null) {
							return null;
						}
						newLangToken = sap.firefly.TmxToken.createTokenByType(
								sap.firefly.TmxTokenType.LANGUAGE, 0);
						childrenSize = children.size();
						for (i = 0; i < childrenSize; i++) {
							newLangToken.addChild(children.get(i));
						}
						return newLangToken;
					},
					transformQuery : function(query) {
						var rootChildren = this.transformCanonicals(query
								.getChildren());
						var newQueryToken;
						var childrenSize;
						var i;
						var tmxToken;
						var type;
						var selectToken;
						var whereToken;
						var membersToken;
						var orderByToken;
						var offsetToken;
						if (rootChildren === null) {
							return null;
						}
						newQueryToken = sap.firefly.TmxToken.createTokenByType(
								sap.firefly.TmxTokenType.QUERY, 0);
						childrenSize = rootChildren.size();
						for (i = 0; i < childrenSize; i++) {
							tmxToken = rootChildren.get(i);
							type = tmxToken.getType();
							if (type === sap.firefly.TmxTokenType.SELECT) {
								selectToken = this.transformSelect(tmxToken);
								if (selectToken === null) {
									return null;
								}
								newQueryToken.addChild(selectToken);
							} else {
								if (type === sap.firefly.TmxTokenType.WHERE) {
									whereToken = this.transformWhere(tmxToken);
									if (whereToken === null) {
										return null;
									}
									newQueryToken.addChild(whereToken);
								} else {
									if (type === sap.firefly.TmxTokenType.MEMBERS) {
										membersToken = this
												.transformDimMemberDef(tmxToken);
										if (membersToken === null) {
											return null;
										}
										newQueryToken.addChild(membersToken);
									} else {
										if (type === sap.firefly.TmxTokenType.ORDER_BY) {
											orderByToken = this
													.transformOrderBy(tmxToken);
											if (orderByToken === null) {
												return null;
											}
											newQueryToken
													.addChild(orderByToken);
										} else {
											if (type === sap.firefly.TmxTokenType.OFFSET) {
												offsetToken = this
														.transformOffset(tmxToken);
												if (offsetToken === null) {
													return null;
												}
												newQueryToken
														.addChild(offsetToken);
											} else {
												this
														.addError(
																sap.firefly.ErrorCodes.INVALID_TOKEN,
																sap.firefly.XString
																		.concatenate2(
																				"Not supported token: ",
																				type
																						.getName()));
												return null;
											}
										}
									}
								}
							}
						}
						return newQueryToken;
					},
					transformCanonicals : function(elements) {
						this.transformBracketsAsChildren(elements);
						if (this.transformBracketsSepCleanup(elements) === false) {
							return null;
						}
						this.transformNames(elements);
						return elements;
					},
					transformBracketsAsChildren : function(elements) {
						var lastTmxToken = null;
						var lastType = null;
						var i;
						var tmxToken;
						var type;
						var children;
						for (i = 0; i < elements.size();) {
							tmxToken = elements.get(i);
							type = tmxToken.getType();
							children = tmxToken.getChildren();
							if ((children !== null)
									&& (children.isEmpty() === false)) {
								this.transformBracketsAsChildren(children);
							}
							if ((lastTmxToken !== null) && (lastType !== null)) {
								if ((type === sap.firefly.TmxTokenType.SQUARE_BRACKETS)
										&& lastType.canHaveSquareBrackets()) {
									lastTmxToken.addChild(tmxToken);
									elements.removeAt(i);
									continue;
								}
							}
							lastTmxToken = tmxToken;
							lastType = type;
							i++;
						}
						return true;
					},
					transformBracketsSepCleanup : function(elements) {
						var size = elements.size();
						var i;
						var tmxToken;
						var children;
						var newToken;
						for (i = 0; i < size; i++) {
							tmxToken = elements.get(i);
							children = tmxToken.getChildren();
							if ((children !== null)
									&& (children.isEmpty() === false)) {
								this.transformBracketsSepCleanup(children);
							}
							if (tmxToken.getType() === sap.firefly.TmxTokenType.SQUARE_BRACKETS) {
								newToken = this
										.transformSimpleEnumeration(tmxToken);
								if (newToken === null) {
									return false;
								}
								elements.set(i, newToken);
							}
						}
						return true;
					},
					transformSimpleEnumeration : function(token) {
						var newArrayToken = sap.firefly.TmxToken
								.createTokenByType(token.getType(), token
										.getPosition());
						var tokenList = token.getChildren();
						var sepExpected = false;
						var tokenSize = tokenList.size();
						var i;
						var currentToken;
						var currentType;
						for (i = 0; i < tokenSize; i++) {
							currentToken = tokenList.get(i);
							currentType = currentToken.getType();
							if (sepExpected) {
								if ((currentType !== sap.firefly.TmxTokenType.SEPARATOR)) {
									return this.addTransformErrorAndReturnNull(
											"Separator expected", currentToken);
								}
								sepExpected = false;
							} else {
								if (currentType === sap.firefly.TmxTokenType.SEPARATOR) {
									return this.addTransformErrorAndReturnNull(
											"Separator not expected",
											currentToken);
								}
								sepExpected = true;
								newArrayToken.addChild(currentToken);
							}
						}
						return newArrayToken;
					},
					transformNames : function(elements) {
						var subNameToken = null;
						var hasSubName = false;
						var i;
						var tmxToken;
						var children;
						for (i = elements.size() - 1; i >= 0; i--) {
							tmxToken = elements.get(i);
							if (tmxToken.getType() === sap.firefly.TmxTokenType.DOT_SEPARATOR) {
								hasSubName = true;
							} else {
								if (hasSubName) {
									tmxToken.setSubNameToken(subNameToken);
									elements.removeAt(i + 2);
									elements.removeAt(i + 1);
									hasSubName = false;
								}
								children = tmxToken.getChildren();
								if ((children !== null)
										&& (children.isEmpty() === false)) {
									this.transformNames(children);
								}
								subNameToken = tmxToken;
							}
						}
					},
					transformWhere : function(token) {
						return this.transformSubOperation(token,
								sap.firefly.TmxTokenType.WHERE);
					},
					transformOrderBy : function(token) {
						var parsedTokens = token.getChildren();
						var newToken = sap.firefly.TmxToken.createTokenByType(
								sap.firefly.TmxTokenType.ORDER_BY, token
										.getPosition());
						var currentToken = token;
						var parsedSize = parsedTokens.size();
						var position;
						var sortItem;
						var currentType;
						for (position = 0; position < parsedSize; position++) {
							currentToken = parsedTokens.get(position);
							sortItem = sap.firefly.TmxToken.createTokenByType(
									sap.firefly.TmxTokenType.SORT_ITEM,
									currentToken.getPosition());
							newToken.addChild(sortItem);
							currentType = currentToken.getType();
							if ((currentType === sap.firefly.TmxTokenType.MEASURES)
									|| (currentType === sap.firefly.TmxTokenType.NAME)
									|| (currentType === sap.firefly.TmxTokenType.IDENTIFIER)
									|| currentType
											.isTypeOf(sap.firefly.TmxTokenType.SORT_FUNCTION)) {
								sortItem.addChild(currentToken);
							} else {
								return this
										.addTransformErrorAndReturnNull(
												"Dimension or measures structure required",
												currentToken);
							}
							position++;
							if (position >= parsedSize) {
								break;
							}
							currentToken = parsedTokens.get(position);
							currentType = currentToken.getType();
							if ((currentType === sap.firefly.TmxTokenType.ASC)
									|| (currentType === sap.firefly.TmxTokenType.DESC)) {
								sortItem.addChild(currentToken);
								position++;
								if (position >= parsedSize) {
									break;
								}
								currentToken = parsedTokens.get(position);
								currentType = currentToken.getType();
							}
							if (currentType === sap.firefly.TmxTokenType.BREAK) {
								sortItem.addChild(currentToken);
								position++;
								if (position >= parsedSize) {
									break;
								}
								currentToken = parsedTokens.get(position);
								currentType = currentToken.getType();
							}
							if (currentType !== sap.firefly.TmxTokenType.SEPARATOR) {
								return this.addTransformErrorAndReturnNull(
										"Missing ',' separator", currentToken);
							}
						}
						return newToken;
					},
					transformDimMemberDef : function(token) {
						var parsedTokens = token.getChildren();
						var membersToken = sap.firefly.TmxToken
								.createTokenByType(
										sap.firefly.TmxTokenType.MEMBERS, token
												.getPosition());
						var currentToken = token;
						var parsedSize = parsedTokens.size();
						var position;
						var currentType;
						var dimToken;
						var dimContext;
						for (position = 0; position < parsedSize; position++) {
							currentToken = parsedTokens.get(position);
							currentType = currentToken.getType();
							if ((currentType === sap.firefly.TmxTokenType.MEASURES)
									|| (currentType === sap.firefly.TmxTokenType.NAME)
									|| (currentType === sap.firefly.TmxTokenType.IDENTIFIER)
									|| (currentType
											.isTypeOf(sap.firefly.TmxTokenType.TMX_FUNCTION))) {
								membersToken.addChild(currentToken);
							} else {
								return this
										.addTransformErrorAndReturnNull(
												"Dimension, measures structure or Tmx-Function required",
												currentToken);
							}
							position++;
							if (position >= parsedSize) {
								return this.addTransformErrorAndReturnNull(
										"Missing next token", currentToken);
							}
							dimToken = currentToken;
							currentToken = parsedTokens.get(position);
							currentType = currentToken.getType();
							if (currentType === sap.firefly.TmxTokenType.ROUND_BRACKETS) {
								dimContext = this.transformExpressionsSequence(
										currentToken, true);
								if (dimContext === null) {
									return null;
								}
								dimToken.addChild(dimContext);
							} else {
								return this.addTransformErrorAndReturnNull(
										"Missing round brackets", currentToken);
							}
							position++;
							if (position >= parsedSize) {
								break;
							}
							currentToken = parsedTokens.get(position);
							currentType = currentToken.getType();
							if (currentType !== sap.firefly.TmxTokenType.SEPARATOR) {
								return this.addTransformErrorAndReturnNull(
										"Missing ',' separator", currentToken);
							}
						}
						return membersToken;
					},
					transformTmxFunctionSequence : function(token, sequence) {
						var newTmxFunc = null;
						var temp;
						var parameters;
						if ((token !== null)
								&& token.getType().isTypeOf(
										sap.firefly.TmxTokenType.TMX_FUNCTION)) {
							temp = sap.firefly.TmxToken.createToken(token
									.getName(), token.getType(), token
									.getPosition());
							parameters = this.transformExpressionsSequence(
									sequence, false);
							if (parameters !== null) {
								temp.addChild(parameters);
								newTmxFunc = temp;
							}
						}
						return newTmxFunc;
					},
					transformExpressionsSequence : function(token,
							mustBeAssignment) {
						var dimContext = sap.firefly.TmxToken
								.createTokenByType(
										sap.firefly.TmxTokenType.ROUND_BRACKETS_LIST,
										0);
						var lastToken = null;
						var currentToken = null;
						var ok;
						var parsedTokens = token.getChildren();
						var parsedSize = parsedTokens.size();
						var position;
						var helper;
						var currentType;
						var isBracket;
						var parameters;
						var newfunction;
						var newTmxFunction;
						var roundBrackets;
						var currentOperator;
						for (position = 0; position < parsedSize; position++) {
							ok = false;
							helper = new sap.firefly.TmxExprHelper();
							for (; position < parsedSize; position++) {
								lastToken = currentToken;
								currentToken = parsedTokens.get(position);
								currentType = currentToken.getType();
								if (currentType === sap.firefly.TmxTokenType.SEPARATOR) {
									if (ok) {
										break;
									}
									return this.addTransformErrorAndReturnNull(
											"',' not expected", currentToken);
								}
								if (currentType === sap.firefly.TmxTokenType.ROUND_BRACKETS) {
									isBracket = true;
									if (lastToken !== null) {
										if ((lastToken.getType() === sap.firefly.TmxTokenType.NAME)
												|| lastToken
														.getType()
														.isTypeOf(
																sap.firefly.TmxTokenType.CONDITION)) {
											isBracket = false;
											parameters = this
													.transformExpressionsSequence(
															currentToken, false);
											if (parameters === null) {
												return null;
											}
											newfunction = sap.firefly.TmxToken
													.createToken(
															lastToken.getName(),
															sap.firefly.TmxTokenType.FUNCTION,
															lastToken
																	.getPosition());
											newfunction.addChild(parameters);
											if (helper.m_opExpCurrentElement
													.isEqualTo(lastToken)) {
												helper.m_opExpCurrentElement = newfunction;
												helper.m_opExpRootElement = newfunction;
											} else {
												helper.m_opExpCurrentElement
														.setRightSide(newfunction);
											}
										} else {
											if (lastToken
													.getType()
													.isTypeOf(
															sap.firefly.TmxTokenType.TMX_FUNCTION)) {
												isBracket = false;
												newTmxFunction = this
														.transformTmxFunctionSequence(
																lastToken,
																currentToken);
												if (newTmxFunction === null) {
													return null;
												}
												ok = sap.firefly.TmxParser
														.transformSingleEntity(
																helper,
																newTmxFunction);
												if (helper.m_opExpCurrentElement
														.isEqualTo(lastToken)) {
													helper.m_opExpCurrentElement = newTmxFunction;
													helper.m_opExpRootElement = newTmxFunction;
												} else {
													helper.m_opExpCurrentElement
															.setRightSide(newTmxFunction);
												}
											}
										}
									}
									if (isBracket) {
										roundBrackets = this
												.transformSubOperation(
														currentToken,
														sap.firefly.TmxTokenType.ROUND_BRACKETS);
										if (roundBrackets === null) {
											return null;
										}
										ok = sap.firefly.TmxParser
												.transformSingleEntity(helper,
														roundBrackets);
									}
								} else {
									currentOperator = currentType.getOperator();
									if (currentOperator === null) {
										ok = sap.firefly.TmxParser
												.transformSingleEntity(helper,
														currentToken);
									} else {
										ok = sap.firefly.TmxParser
												.transformOperator(helper,
														currentToken);
									}
								}
								if (ok === false) {
									return this.addTransformErrorAndReturnNull(
											"No valid expression ",
											currentToken);
								}
							}
							if (helper.m_opExpRootElement === null) {
								return this.addTransformErrorAndReturnNull(
										"No valid expression ", currentToken);
							}
							if (mustBeAssignment) {
								currentType = helper.m_opExpRootElement
										.getType();
								if ((currentType !== sap.firefly.TmxTokenType.OP_ASSIGN)
										&& (currentType !== sap.firefly.TmxTokenType.OP_ASSIGN_DEF)
										&& (currentType !== sap.firefly.TmxTokenType.OP_ASSIGN_PROP)) {
									return this
											.addTransformErrorAndReturnNull(
													"No valid expression, '=' , '=:' or '=>' expected",
													currentToken);
								}
								if (helper.m_opExpRootElement.getLeftSide() === null) {
									return this
											.addTransformErrorAndReturnNull(
													"No valid expression, missing left side",
													currentToken);
								}
								if (helper.m_opExpRootElement.getRightSide() === null) {
									return this
											.addTransformErrorAndReturnNull(
													"No valid expression, missing right side",
													currentToken);
								}
							}
							dimContext.addChild(helper.m_opExpRootElement);
						}
						return dimContext;
					},
					transformOffset : function(token) {
						var parsedTokens = token.getChildren();
						var newOffsetToken = sap.firefly.TmxToken
								.createTokenByType(
										sap.firefly.TmxTokenType.OFFSET, 0);
						var parsedSize = parsedTokens.size();
						var newOffsetTokenChild;
						var currentToken;
						var nextToken;
						var i;
						var previousToken;
						var currentType;
						if (parsedSize > 0) {
							newOffsetTokenChild = null;
							currentToken = null;
							nextToken = null;
							for (i = 0; i < parsedSize; i++) {
								previousToken = currentToken;
								currentToken = parsedTokens.get(i);
								currentType = currentToken.getType();
								if (parsedSize > (i + 1)) {
									nextToken = parsedTokens.get(i + 1);
								} else {
									nextToken = null;
								}
								if (currentType === sap.firefly.TmxTokenType.NUMBER) {
									if (previousToken === null) {
										if (nextToken === null) {
											this
													.addTransformError(
															"Incomplete offset definition: ",
															currentToken);
											continue;
										}
										if ((nextToken.getType() === sap.firefly.TmxTokenType.NUMBER)
												|| (nextToken.getType() === sap.firefly.TmxTokenType.ON)) {
											newOffsetTokenChild = sap.firefly.TmxToken
													.createTokenByType(
															sap.firefly.TmxTokenType.GENERIC,
															0);
											currentToken
													.setType(sap.firefly.TmxTokenType.OFFSET_FROM);
											newOffsetTokenChild
													.addChild(currentToken);
										}
									} else {
										if ((previousToken.getType() === sap.firefly.TmxTokenType.OFFSET_FROM)
												|| (previousToken.getType() === sap.firefly.TmxTokenType.SEPARATOR)) {
											if (nextToken === null) {
												this
														.addTransformError(
																"incomplete offset definition: ",
																currentToken);
												continue;
											}
											if (nextToken.getType() === sap.firefly.TmxTokenType.ON) {
												currentToken
														.setType(sap.firefly.TmxTokenType.OFFSET_TO);
												if (newOffsetTokenChild !== null) {
													newOffsetTokenChild
															.addChild(currentToken);
												}
											} else {
												this
														.addTransformError(
																"Missing range or axis context: ",
																currentToken);
											}
										} else {
											this
													.addTransformError(
															"Incomplete offset definition: ",
															currentToken);
										}
									}
								} else {
									if (currentType === sap.firefly.TmxTokenType.ON) {
										if (previousToken === null) {
											this
													.addTransformError(
															"Missing range definition: ",
															currentToken);
											continue;
										}
										if ((previousToken.getType() === sap.firefly.TmxTokenType.OFFSET_FROM)
												|| (previousToken.getType() === sap.firefly.TmxTokenType.OFFSET_TO)) {
											if (nextToken === null) {
												this
														.addTransformError(
																"Missing axis definition: ",
																currentToken);
												continue;
											}
											if ((nextToken.getType() === sap.firefly.TmxTokenType.ROWS)
													|| (nextToken.getType() === sap.firefly.TmxTokenType.COLUMNS)
													|| (nextToken.getType() === sap.firefly.TmxTokenType.FREE)) {
												if (newOffsetTokenChild !== null) {
													newOffsetTokenChild
															.addChild(currentToken);
												}
											} else {
												this
														.addTransformError(
																"Missing axis definition: ",
																currentToken);
											}
										} else {
											this
													.addTransformError(
															"Missing range definition: ",
															currentToken);
										}
									} else {
										if ((currentType === sap.firefly.TmxTokenType.ROWS)
												|| (currentType === sap.firefly.TmxTokenType.COLUMNS)
												|| (currentType === sap.firefly.TmxTokenType.FREE)) {
											if (previousToken === null) {
												this
														.addTransformError(
																"Missing range definition: ",
																currentToken);
												continue;
											}
											if (previousToken.getType() === sap.firefly.TmxTokenType.ON) {
												if (newOffsetTokenChild !== null) {
													newOffsetTokenChild
															.addChild(currentToken);
													newOffsetToken
															.addChild(newOffsetTokenChild);
													newOffsetTokenChild = null;
												}
											} else {
												this
														.addTransformError(
																"Missing context for axis: ",
																currentToken);
											}
										} else {
											if (currentType === sap.firefly.TmxTokenType.SEPARATOR) {
												if (previousToken === null) {
													this
															.addTransformError(
																	"Incomplete offset definition: ",
																	currentToken);
													continue;
												}
												if (nextToken === null) {
													this
															.addTransformError(
																	"Missing next offset definition ",
																	currentToken);
													continue;
												}
												if ((previousToken.getType() === sap.firefly.TmxTokenType.ROWS)
														|| (previousToken
																.getType() === sap.firefly.TmxTokenType.COLUMNS)
														|| (previousToken
																.getType() === sap.firefly.TmxTokenType.FREE)) {
													if (nextToken.getType() === sap.firefly.TmxTokenType.NUMBER) {
														newOffsetTokenChild = sap.firefly.TmxToken
																.createTokenByType(
																		sap.firefly.TmxTokenType.GENERIC,
																		0);
														currentToken = null;
													} else {
														this
																.addTransformError(
																		"Missing range definition: ",
																		currentToken);
													}
												}
											} else {
												this.addTransformError(
														"Unknown token: ",
														currentToken);
											}
										}
									}
								}
							}
						} else {
							this.addTransformError(
									"Incomplete Offset Definition: ", token);
						}
						if ((newOffsetToken.getChildren() === null)
								|| newOffsetToken.getChildren().isEmpty()) {
							return null;
						}
						return newOffsetToken;
					},
					transformSubOperation : function(token, tokenType) {
						var parsedTokens = token.getChildren();
						var currentToken = null;
						var currentType = null;
						var ok = false;
						var helper = new sap.firefly.TmxExprHelper();
						var parsedSize = parsedTokens.size();
						var i;
						var lastToken;
						var lastType;
						var nesting;
						var newTmxFunction;
						var newTokenList;
						var roundBrackets;
						var subToken;
						for (i = 0; i < parsedSize; i++) {
							lastToken = currentToken;
							lastType = currentType;
							currentToken = parsedTokens.get(i);
							currentType = currentToken.getType();
							if (currentType === sap.firefly.TmxTokenType.ROUND_BRACKETS) {
								nesting = true;
								if (lastToken !== null) {
									if (lastType
											.isTypeOf(sap.firefly.TmxTokenType.TMX_FUNCTION)) {
										nesting = false;
										newTmxFunction = this
												.transformTmxFunctionSequence(
														lastToken, currentToken);
										if (newTmxFunction === null) {
											return null;
										}
										ok = sap.firefly.TmxParser
												.transformSingleEntity(helper,
														newTmxFunction);
									} else {
										if (lastType === sap.firefly.TmxTokenType.IN) {
											nesting = false;
											newTokenList = sap.firefly.TmxParser
													.transformList(
															currentToken,
															sap.firefly.TmxTokenType.ROUND_BRACKETS_LIST,
															lastType);
											ok = sap.firefly.TmxParser
													.transformSingleEntity(
															helper,
															newTokenList);
										}
									}
								}
								if (nesting) {
									roundBrackets = this
											.transformSubOperation(
													currentToken,
													sap.firefly.TmxTokenType.ROUND_BRACKETS);
									ok = sap.firefly.TmxParser
											.transformSingleEntity(helper,
													roundBrackets);
								}
							} else {
								if (currentType
										.isTypeOf(sap.firefly.TmxTokenType.CONDITION)) {
									continue;
								} else {
									if (currentType.getOperator() === null) {
										ok = sap.firefly.TmxParser
												.transformSingleEntity(helper,
														currentToken);
									} else {
										if (lastType
												.isTypeOf(sap.firefly.TmxTokenType.CONDITION)) {
											currentToken
													.setCondition(lastToken);
										}
										ok = sap.firefly.TmxParser
												.transformOperator(helper,
														currentToken);
									}
								}
							}
							if (ok === false) {
								return this.addTransformErrorAndReturnNull(
										"No valid expression ", currentToken);
							}
						}
						if (helper.m_opExpRootElement === null) {
							return this.addTransformErrorAndReturnNull(
									"No valid expression ", currentToken);
						}
						if (tokenType !== null) {
							subToken = sap.firefly.TmxToken.createTokenByType(
									tokenType, token.getPosition());
							subToken.addChild(helper.m_opExpRootElement);
							return subToken;
						}
						return helper.m_opExpRootElement;
					},
					transformSelect : function(token) {
						var selectToken = sap.firefly.TmxToken
								.createTokenByType(
										sap.firefly.TmxTokenType.SELECT, 0);
						var parsedTokens = token.getChildren();
						var position = 0;
						var hasMoreAxis = true;
						var currentToken = token;
						var parsedSize = parsedTokens.size();
						var axis;
						var element;
						var currentType;
						while (hasMoreAxis) {
							if (position >= parsedSize) {
								return this.addTransformErrorAndReturnNull(
										"Missing next token", currentToken);
							}
							axis = sap.firefly.TmxToken.createToken("axis",
									sap.firefly.TmxTokenType.AXIS, currentToken
											.getPosition());
							selectToken.addChild(axis);
							while (true) {
								currentToken = parsedTokens.get(position);
								currentType = currentToken.getType();
								if ((currentType === sap.firefly.TmxTokenType.IDENTIFIER)
										|| currentType
												.isTypeOf(sap.firefly.TmxTokenType.NAME)
										|| currentType
												.isTypeOf(sap.firefly.TmxTokenType.BRACKETS)) {
									element = currentToken;
								} else {
									return this.addTransformErrorAndReturnNull(
											"Identifier or name expected",
											currentToken);
								}
								axis.addChild(element);
								position++;
								if (position >= parsedSize) {
									return selectToken;
								}
								currentToken = parsedTokens.get(position);
								currentType = currentToken.getType();
								if (currentType === sap.firefly.TmxTokenType.SEPARATOR) {
									position++;
								} else {
									if (currentType === sap.firefly.TmxTokenType.ON) {
										position++;
										if (position >= parsedSize) {
											return this
													.addTransformErrorAndReturnNull(
															"Missing next token",
															currentToken);
										}
										currentToken = parsedTokens
												.get(position);
										currentType = currentToken.getType();
										if ((currentType === sap.firefly.TmxTokenType.COLUMNS)
												|| (currentType === sap.firefly.TmxTokenType.ROWS)
												|| (currentType === sap.firefly.TmxTokenType.FREE)) {
											if (currentType === sap.firefly.TmxTokenType.COLUMNS) {
												axis
														.setType(sap.firefly.TmxTokenType.COLUMN_AXIS);
											} else {
												if (currentType === sap.firefly.TmxTokenType.ROWS) {
													axis
															.setType(sap.firefly.TmxTokenType.ROWS_AXIS);
												} else {
													axis
															.setType(sap.firefly.TmxTokenType.FREE_AXIS);
												}
											}
											position++;
											if (position >= parsedSize) {
												return selectToken;
											}
											currentToken = parsedTokens
													.get(position);
											currentType = currentToken
													.getType();
											if (currentType === sap.firefly.TmxTokenType.SEPARATOR) {
												break;
											}
											return this
													.addTransformErrorAndReturnNull(
															"Axis definition expected",
															currentToken);
										}
										return this
												.addTransformErrorAndReturnNull(
														"Expected rows or columns token",
														currentToken);
									}
								}
							}
							position++;
						}
						return selectToken;
					},
					handleJson : function(c) {
						var retValue = this.m_jsonParser.parseSingleCharacter(
								c, this.m_pos);
						if (retValue === false) {
							this.addAllMessages(this.m_jsonParser);
							return false;
						}
						if (this.m_jsonParser.isEmbeddedParsingFinished()) {
							this.m_isTmxInsideJson = false;
							if (this.setJsonElement(this.m_jsonParser
									.getRootElement()) === false) {
								return false;
							}
						}
						return true;
					},
					createTokenAndAddChild : function(tkType) {
						var token = sap.firefly.TmxToken.createTokenByType(
								tkType, this.m_pos);
						this.getStackTop().addChild(token);
						return true;
					},
					isInsideLess : function(c) {
						if (c === 61) {
							this
									.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_LESS_EQUAL);
						} else {
							if (c === 62) {
								this
										.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_NOT_EQUAL);
							} else {
								this
										.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_LESS);
								return sap.firefly.TriStateBool._DEFAULT;
							}
						}
						return sap.firefly.TriStateBool._TRUE;
					},
					isInsideGreater : function(c) {
						if (c === 61) {
							this
									.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_GREATER_EQUAL);
						} else {
							this
									.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_GREATER);
							return sap.firefly.TriStateBool._DEFAULT;
						}
						return sap.firefly.TriStateBool._TRUE;
					},
					isInsideEquals : function(c) {
						if (c === 61) {
							this
									.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_EQUAL);
						} else {
							if (c === 58) {
								this
										.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_ASSIGN_DEF);
							} else {
								if (c === 62) {
									this
											.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_ASSIGN_PROP);
								} else {
									this
											.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_ASSIGN);
									return sap.firefly.TriStateBool._DEFAULT;
								}
							}
						}
						return sap.firefly.TriStateBool._TRUE;
					},
					appendEscapedChar : function(c, escapedString) {
						var value;
						if (c === 114) {
							escapedString.append("\r");
						} else {
							if (c === 110) {
								escapedString.append("\n");
							} else {
								if (c === 116) {
									escapedString.append("\t");
								} else {
									if (c === 102) {
										escapedString.append("\f");
									} else {
										if (c === 98) {
											escapedString.append("\b");
										} else {
											if (c === 34) {
												escapedString.append('"');
											} else {
												if (c === 92) {
													escapedString.append("\\");
												} else {
													if (c === 47) {
														escapedString
																.append("/");
													} else {
														if (c === 117) {
															value = sap.firefly.XString
																	.substring(
																			this.m_source,
																			this.m_pos + 1,
																			this.m_pos + 5);
															this.m_pos = this.m_pos + 4;
															try {
																escapedString
																		.appendChar(sap.firefly.XInteger
																				.convertStringToIntegerWithRadix(
																						value,
																						16));
															} catch (nfe3) {
																return this
																		.addErrorAndReturnFalse("Integer parsing exception");
															}
														} else {
															return this
																	.addErrorAndReturnFalse("Unexpected character inside string escape");
														}
													}
												}
											}
										}
									}
								}
							}
						}
						return true;
					},
					runWalker : function() {
						var lastCharacterNonSpace = 0;
						var value;
						var isInsideIdentifier = false;
						var isInsideString = false;
						var isInsideName = false;
						var isInsideEscape = false;
						var isInsideNumber = false;
						var isInsideDoubleNumber = false;
						var isInsideLess = false;
						var isInsideGreater = false;
						var isInsideEquals = false;
						var isInsideNotEquals = false;
						var isInsideAnd = false;
						var isInsideOr = false;
						var isInsideDollarKeyword = false;
						var isInsideTildeKeyword = false;
						var placeHolder;
						var stringStartPos;
						var escapedString;
						var numberStartPos;
						var charArray;
						var len;
						var c;
						var insideEquals;
						var insideLess;
						var insideGreater;
						this.m_isTmxInsideJson = false;
						placeHolder = false;
						this.m_pos = 0;
						this.m_isValid = true;
						stringStartPos = 0;
						escapedString = null;
						numberStartPos = 0;
						sap.firefly.TmxParser.startParsing();
						charArray = sap.firefly.XCharArray
								.create(this.m_source);
						len = charArray.size();
						for (; (this.m_pos <= len) && (this.m_isValid);) {
							if (this.m_pos < len) {
								c = charArray.get(this.m_pos);
							} else {
								c = 0;
							}
							if (this.m_isTmxInsideJson) {
								if (this.handleJson(c) === false) {
									return false;
								}
							} else {
								if (isInsideEquals) {
									insideEquals = this.isInsideEquals(c);
									isInsideEquals = false;
									if (insideEquals === sap.firefly.TriStateBool._DEFAULT) {
										continue;
									}
								} else {
									if (isInsideNotEquals) {
										if (this.isInsideNotEquals(c) === false) {
											return false;
										}
										isInsideNotEquals = false;
									} else {
										if (isInsideAnd) {
											if (this.isInsideAnd(c) === false) {
												return false;
											}
											isInsideAnd = false;
										} else {
											if (isInsideOr) {
												if (this.isInsideOr(c) === false) {
													return false;
												}
												isInsideOr = false;
											} else {
												if (isInsideLess) {
													insideLess = this
															.isInsideLess(c);
													isInsideLess = false;
													if (insideLess === sap.firefly.TriStateBool._DEFAULT) {
														continue;
													}
												} else {
													if (isInsideGreater) {
														isInsideGreater = false;
														insideGreater = this
																.isInsideGreater(c);
														if (insideGreater === sap.firefly.TriStateBool._DEFAULT) {
															continue;
														}
													} else {
														if ((isInsideIdentifier)
																|| (isInsideString)) {
															if (isInsideEscape) {
																if (this
																		.appendEscapedChar(
																				c,
																				escapedString) === false) {
																	return false;
																}
																isInsideEscape = false;
																stringStartPos = this.m_pos + 1;
															} else {
																if ((c === 39)) {
																	this
																			.insideQuote(
																					escapedString,
																					stringStartPos,
																					true);
																	isInsideIdentifier = false;
																} else {
																	if (c === 34) {
																		this
																				.insideQuote(
																						escapedString,
																						stringStartPos,
																						false);
																		isInsideString = false;
																	} else {
																		if (c === 92) {
																			isInsideEscape = true;
																			if (escapedString === null) {
																				escapedString = sap.firefly.XStringBuffer
																						.create();
																			}
																			value = sap.firefly.XString
																					.substring(
																							this.m_source,
																							stringStartPos,
																							this.m_pos);
																			escapedString
																					.append(value);
																		}
																	}
																}
															}
														} else {
															if (isInsideNumber) {
																if ((c >= 48)
																		&& (c <= 57)) {
																	placeHolder = false;
																} else {
																	if ((c === 46)
																			|| (c === 101)
																			|| (c === 69)) {
																		isInsideDoubleNumber = true;
																	} else {
																		value = sap.firefly.XString
																				.substring(
																						this.m_source,
																						numberStartPos,
																						this.m_pos);
																		if (isInsideDoubleNumber) {
																			if (this
																					.insideDouble(value) === false) {
																				return false;
																			}
																		} else {
																			if (this
																					.insideInteger(value) === false) {
																				return false;
																			}
																		}
																		isInsideNumber = false;
																		isInsideDoubleNumber = false;
																		continue;
																	}
																}
															} else {
																if ((isInsideName)
																		|| (isInsideDollarKeyword)
																		|| (isInsideTildeKeyword)) {
																	if (((c >= 48) && (c <= 57))
																			|| ((c >= 65) && (c <= 90))
																			|| ((c >= 97) && (c <= 122))
																			|| (c === 95)
																			|| (c === 45)) {
																		placeHolder = false;
																	} else {
																		value = sap.firefly.XString
																				.substring(
																						this.m_source,
																						stringStartPos,
																						this.m_pos);
																		if (isInsideName) {
																			if (this
																					.addName(value) === false) {
																				return this
																						.addErrorAndReturnFalse("Not possible: set variable");
																			}
																			isInsideName = false;
																		} else {
																			if (isInsideTildeKeyword) {
																				this
																						.addTildeKeyword(value);
																				isInsideTildeKeyword = false;
																			} else {
																				return this
																						.addErrorAndReturnFalse("Not possible: set dollar keyword");
																			}
																		}
																		continue;
																	}
																} else {
																	if ((c === 43)
																			|| (c === 45)) {
																		if ((lastCharacterNonSpace === 0)
																				|| (lastCharacterNonSpace === 61)
																				|| (lastCharacterNonSpace === 58)
																				|| (lastCharacterNonSpace === 40)
																				|| (lastCharacterNonSpace === 91)
																				|| (lastCharacterNonSpace === 44)
																				|| (lastCharacterNonSpace === 42)
																				|| (lastCharacterNonSpace === 47)
																				|| (lastCharacterNonSpace === 43)
																				|| (lastCharacterNonSpace === 45)
																				|| (lastCharacterNonSpace === 38)
																				|| (lastCharacterNonSpace === 124)
																				|| (lastCharacterNonSpace === 60)
																				|| (lastCharacterNonSpace === 62)) {
																			isInsideNumber = true;
																			numberStartPos = this.m_pos;
																		} else {
																			if (c === 43) {
																				this
																						.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_PLUS);
																			} else {
																				if (c === 45) {
																					this
																							.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_MINUS);
																				}
																			}
																		}
																	} else {
																		if ((c >= 48)
																				&& (c <= 57)) {
																			isInsideNumber = true;
																			numberStartPos = this.m_pos;
																		} else {
																			if (c === 46) {
																				this
																						.createTokenAndAddChild(sap.firefly.TmxTokenType.DOT_SEPARATOR);
																			} else {
																				if (c === 123) {
																					this.m_isTmxInsideJson = true;
																					this.m_jsonParser = sap.firefly.JxJsonParser
																							.createEmbedded(this.m_source);
																					continue;
																				} else {
																					if (c === 40) {
																						this
																								.enterRoundBracket();
																					} else {
																						if (c === 41) {
																							if (this
																									.leaveRoundBracket() === false) {
																								return this
																										.addErrorAndReturnFalse("Not possible: leave round bracket");
																							}
																						} else {
																							if (c === 91) {
																								this
																										.enterArray();
																							} else {
																								if (c === 93) {
																									if (this
																											.leaveArray() === false) {
																										return this
																												.addErrorAndReturnFalse("Not possible: leave structure");
																									}
																								} else {
																									if (c === 33) {
																										isInsideNotEquals = true;
																									} else {
																										if (c === 61) {
																											isInsideEquals = true;
																										} else {
																											if (c === 47) {
																												this
																														.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_DIV);
																											} else {
																												if (c === 42) {
																													this
																															.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_MULT);
																												} else {
																													if (c === 60) {
																														isInsideLess = true;
																													} else {
																														if (c === 62) {
																															isInsideGreater = true;
																														} else {
																															if (c === 38) {
																																isInsideAnd = true;
																															} else {
																																if (c === 124) {
																																	isInsideOr = true;
																																} else {
																																	if (c === 44) {
																																		this
																																				.createTokenAndAddChild(sap.firefly.TmxTokenType.SEPARATOR);
																																	} else {
																																		if ((c === 39)) {
																																			isInsideIdentifier = true;
																																			stringStartPos = this.m_pos + 1;
																																		} else {
																																			if (c === 34) {
																																				isInsideString = true;
																																				stringStartPos = this.m_pos + 1;
																																			} else {
																																				if (((c >= 65) && (c <= 90))
																																						|| ((c >= 97) && (c <= 122))
																																						|| (c === 95)) {
																																					isInsideName = true;
																																					stringStartPos = this.m_pos;
																																				} else {
																																					if (c === 36) {
																																						isInsideDollarKeyword = true;
																																						stringStartPos = this.m_pos;
																																					} else {
																																						if (c === 126) {
																																							isInsideTildeKeyword = true;
																																							stringStartPos = this.m_pos;
																																						} else {
																																							if (c === 0) {
																																								break;
																																							} else {
																																								if ((c !== 32)
																																										&& (c !== 13)
																																										&& (c !== 10)
																																										&& (c !== 9)) {
																																									return this
																																											.addErrorAndReturnFalse("Invalid character");
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
								}
							}
							this.m_pos++;
							if ((c !== 32) && (c !== 10) && (c !== 13)
									&& (c !== 9)) {
								lastCharacterNonSpace = c;
							}
						}
						if (this.m_isValid) {
							sap.firefly.TmxParser.endParsing();
						}
						isInsideString = placeHolder;
						return this.m_isValid;
					},
					addErrorAndReturnFalse : function(message) {
						this.addParserError(message);
						return false;
					},
					isInsideOr : function(c) {
						if (this.checkCharacterIsExpected(c, 124,
								"Wrong character, expected: '|'")) {
							return this
									.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_OR);
						}
						return false;
					},
					isInsideAnd : function(c) {
						if (this.checkCharacterIsExpected(c, 38,
								"Wrong character, expected: '&'")) {
							return this
									.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_AND);
						}
						return false;
					},
					isInsideNotEquals : function(c) {
						if (this.checkCharacterIsExpected(c, 61,
								"Wrong character, expected: '='")) {
							return this
									.createTokenAndAddChild(sap.firefly.TmxTokenType.OP_NOT_EQUAL);
						}
						return false;
					},
					checkCharacterIsExpected : function(c, compare, message) {
						if (c !== compare) {
							return this.addErrorAndReturnFalse(message);
						}
						return true;
					},
					insideInteger : function(value) {
						try {
							var isInt = true;
							var leni = sap.firefly.XString.size(value);
							var minus = sap.firefly.XString.getCharAt(value, 0);
							if (minus === 45) {
								isInt = (leni <= 10);
							} else {
								isInt = (leni <= 9);
							}
							if (isInt) {
								this.addInteger(sap.firefly.XInteger
										.convertStringToInteger(value));
							} else {
								this.addLong(sap.firefly.XLong
										.convertStringToLong(value));
							}
						} catch (nfe2) {
							return this
									.addErrorAndReturnFalse("Integer parsing exception");
						}
						return true;
					},
					insideDouble : function(value) {
						try {
							this.addDouble(sap.firefly.XDouble
									.convertStringToDouble(value));
						} catch (nfe) {
							return this
									.addErrorAndReturnFalse("Double parsing exception");
						}
						return true;
					},
					insideQuote : function(escapedString, stringStartPos,
							isSingleQuote) {
						var value = sap.firefly.XString.substring(
								this.m_source, stringStartPos, this.m_pos);
						if (escapedString !== null) {
							escapedString.append(value);
							value = escapedString.toString();
							escapedString.clear();
						}
						if (isSingleQuote) {
							return this.addIndentifier(value);
						}
						return this.addString(value);
					},
					getSource : function() {
						return this.m_source;
					},
					setSource : function(source) {
						this.m_source = source;
					},
					getRootToken : function() {
						return this.m_rootToken;
					},
					pushOntoStack : function(token) {
						this.m_stack.add(token);
					},
					popFromStack : function() {
						var index = this.m_stack.size() - 1;
						var token = this.m_stack.get(index);
						this.m_stack.removeAt(index);
						return token;
					},
					getStackTop : function() {
						return this.m_stack.get(this.m_stack.size() - 1);
					},
					enterRoundBracket : function() {
						var token = sap.firefly.TmxToken.createTokenByType(
								sap.firefly.TmxTokenType.ROUND_BRACKETS,
								this.m_pos);
						this.getStackTop().addChild(token);
						this.pushOntoStack(token);
						return true;
					},
					leaveRoundBracket : function() {
						var roundBracket = this.popFromStack();
						return (roundBracket.getType() === sap.firefly.TmxTokenType.ROUND_BRACKETS);
					},
					enterArray : function() {
						var token = sap.firefly.TmxToken.createTokenByType(
								sap.firefly.TmxTokenType.SQUARE_BRACKETS,
								this.m_pos);
						this.getStackTop().addChild(token);
						this.pushOntoStack(token);
						return true;
					},
					leaveArray : function() {
						var roundBracket = this.popFromStack();
						return (roundBracket.getType() === sap.firefly.TmxTokenType.SQUARE_BRACKETS);
					},
					addName : function(value) {
						var token = sap.firefly.TmxToken.createToken(value,
								sap.firefly.TmxTokenType.NAME, this.m_pos);
						var stackTop = this.getStackTop();
						var type = token.getType();
						var stackTopType;
						var firstElement;
						var lastChild;
						var convertedType;
						if (type
								.isTypeOf(sap.firefly.TmxTokenType.BLOCK_KEYWORD)) {
							stackTopType = stackTop.getType();
							if (stackTopType
									.isTypeOf(sap.firefly.TmxTokenType.BLOCK_KEYWORD)) {
								this.popFromStack();
								stackTop = this.getStackTop();
							}
							stackTop.addChild(token);
							this.pushOntoStack(token);
						} else {
							firstElement = type.getFirstElement();
							if (firstElement !== null) {
								lastChild = stackTop.getLastChild();
								if (lastChild.getType() === firstElement) {
									stackTop.removeLastChild();
									convertedType = type.getConvertedElement();
									return this
											.addName(convertedType.getName());
								}
							}
							stackTop.addChild(token);
						}
						return true;
					},
					addTildeKeyword : function(value) {
						var tokenType = sap.firefly.TmxTokenType
								.lookupName(value);
						var token;
						var stackTop;
						if (tokenType === null) {
							tokenType = sap.firefly.TmxTokenType.TMX_FUNCTION;
						}
						token = sap.firefly.TmxToken.createToken(value,
								tokenType, this.m_pos);
						stackTop = this.getStackTop();
						stackTop.addChild(token);
						this.m_preProcessingStack.add(token);
						return true;
					},
					addIndentifier : function(value) {
						var token = sap.firefly.TmxToken
								.createToken(value,
										sap.firefly.TmxTokenType.IDENTIFIER,
										this.m_pos);
						this.getStackTop().addChild(token);
						return true;
					},
					addString : function(value) {
						var token = sap.firefly.TmxToken.createToken(value,
								sap.firefly.TmxTokenType.STRING, this.m_pos);
						this.getStackTop().addChild(token);
						return true;
					},
					addDouble : function(value) {
						var token = sap.firefly.TmxToken.createToken(
								sap.firefly.XDouble
										.convertDoubleToString(value),
								sap.firefly.TmxTokenType.NUMBER, this.m_pos);
						token.setDoubleValue(value);
						this.getStackTop().addChild(token);
						return true;
					},
					addLong : function(value) {
						var token = sap.firefly.TmxToken.createToken(
								sap.firefly.XLong.convertLongToString(value),
								sap.firefly.TmxTokenType.NUMBER, this.m_pos);
						token.setLongValue(value);
						this.getStackTop().addChild(token);
						return true;
					},
					addInteger : function(value) {
						var token = sap.firefly.TmxToken.createToken(
								sap.firefly.XInteger
										.convertIntegerToString(value),
								sap.firefly.TmxTokenType.NUMBER, this.m_pos);
						token.setIntegerValue(value);
						this.getStackTop().addChild(token);
						return true;
					},
					setJsonElement : function(structure) {
						var children = this.getStackTop().getChildren();
						var size = children.size();
						var tmxToken;
						if (size === 0) {
							this
									.addParserError("Json structure not expected here");
							return false;
						}
						tmxToken = children.get(size - 1);
						tmxToken.setJsonAttributes(structure);
						return true;
					},
					addTmxFunctionParamError : function(message, token) {
						this.addTmxErrorWithCode(message, token,
								sap.firefly.ErrorCodes.TMX_FUNCTION_PARAMS);
						return null;
					},
					addTmxErrorWithCode : function(message, token, errorCode) {
						return this.addParserErrorExt("Error at position ",
								message, token.getPosition(), errorCode);
					},
					addApplyError : function(message, token) {
						return this.addParserErrorExt(
								"Parser expression apply error at position ",
								message, token.getPosition(),
								sap.firefly.ErrorCodes.TMX_APPLY);
					},
					addTransformErrorAndReturnNull : function(message, token) {
						this.addTransformError(message, token);
						return null;
					},
					addTransformError : function(message, token) {
						return this.addParserErrorExt(
								"Parser transformation error at position ",
								message, token.getPosition(),
								sap.firefly.ErrorCodes.TMX_TRANSFORM);
					},
					addParserError : function(message) {
						return this.addParserErrorExt(
								"Parser error at position ", message,
								this.m_pos, sap.firefly.ErrorCodes.TMX_PARSE);
					},
					addParserErrorExt : function(prefix, message, pos,
							errorCode) {
						var start = pos - 15;
						var end;
						var sourceSnippet;
						var buffer;
						var i;
						var messageExt;
						if (start < 0) {
							start = 0;
						}
						end = pos + 10;
						if (end > sap.firefly.XString.size(this.m_source)) {
							end = sap.firefly.XString.size(this.m_source);
						}
						sourceSnippet = sap.firefly.XString.substring(
								this.m_source, start, end);
						buffer = sap.firefly.XStringBuffer.create();
						buffer.append(prefix);
						buffer.appendInt(pos);
						buffer.append(": ");
						buffer.append(message);
						buffer.appendNewLine();
						buffer.append("...");
						buffer.append(sourceSnippet);
						buffer.append("...");
						buffer.appendNewLine();
						buffer.append("---");
						for (i = 0; i < (pos - start); i++) {
							buffer.append("-");
						}
						buffer.append("^");
						messageExt = buffer.toString();
						return this.addError(errorCode, messageExt);
					}
				});
$Firefly
		.createClass(
				"sap.firefly.TmxToken",
				sap.firefly.XValueAccess,
				{
					$statics : {
						DEBUG : false,
						createTokenByType : function(type, position) {
							return sap.firefly.TmxToken.createToken(type
									.getName(), type, position);
						},
						createToken : function(name, type, position) {
							var children = sap.firefly.XList.create();
							return sap.firefly.TmxToken
									.createTokenWithChildren(name, type,
											position, children);
						},
						createTokenWithChildren : function(name, type,
								position, children) {
							var adaptedName;
							var specificType;
							var newObject;
							if (name === null) {
								adaptedName = type.getName();
							} else {
								adaptedName = name;
							}
							specificType = type;
							if (type === sap.firefly.TmxTokenType.NAME) {
								adaptedName = sap.firefly.XString
										.convertToLowerCase(adaptedName);
								specificType = sap.firefly.TmxTokenType
										.lookupName(adaptedName);
								if (specificType === null) {
									specificType = type;
									adaptedName = name;
								}
							}
							newObject = new sap.firefly.TmxToken();
							newObject.setupToken(adaptedName, specificType,
									position, children);
							return newObject;
						},
						removeNeighborTokenByTypeRecursiv : function(type,
								token) {
							var parent;
							var parentsParent;
							if (token !== null) {
								if (token.getType() === type) {
									parent = token.getParent();
									if (parent !== null) {
										parentsParent = parent.getParent();
										if (parentsParent !== null) {
											if (token.isLeftChildOfParent()) {
												if (parent
														.isLeftChildOfParent()) {
													parentsParent
															.setLeftSide(parent
																	.getRightSide());
												} else {
													if (parent
															.isRightChildOfParent()) {
														parentsParent
																.setRightSide(parent
																		.getRightSide());
													}
												}
											} else {
												if (token
														.isRightChildOfParent()) {
													if (parent
															.isLeftChildOfParent()) {
														parentsParent
																.setLeftSide(parent
																		.getLeftSide());
													} else {
														if (parent
																.isRightChildOfParent()) {
															parentsParent
																	.setRightSide(parent
																			.getLeftSide());
														}
													}
												}
											}
										}
									}
								}
								sap.firefly.TmxToken
										.removeNeighborTokenByTypeRecursiv(
												type, token.getRightSide());
								sap.firefly.TmxToken
										.removeNeighborTokenByTypeRecursiv(
												type, token.getLeftSide());
							}
						},
						removeNeighborToken : function(type, token) {
							if (token.isLeftChildOfParent()) {
								sap.firefly.TmxToken
										.removeNeighborTokenByTypeRecursiv(
												type, token);
								return token.getParent().getLeftSide();
							} else {
								if (token.isRightChildOfParent()) {
									sap.firefly.TmxToken
											.removeNeighborTokenByTypeRecursiv(
													type, token);
									return token.getParent().getRightSide();
								} else {
									return null;
								}
							}
						}
					},
					m_parent : null,
					m_children : null,
					m_tokenType : null,
					m_position : 0,
					m_jsonAttributes : null,
					m_leftSide : null,
					m_rightSide : null,
					m_condition : null,
					m_name : null,
					m_subnameToken : null,
					m_propertyValueBag : null,
					isEqualTo : function(other) {
						return this === other;
					},
					setupToken : function(name, type, position, children) {
						this.m_children = children;
						this.m_name = name;
						this.setType(type);
						this.setPosition(position);
						this.m_propertyValueBag = sap.firefly.XHashMapOfStringByString
								.create();
					},
					releaseObject : function() {
						this.m_children = null;
						this.m_name = null;
						this.m_tokenType = null;
						if (this.m_propertyValueBag !== null) {
							this.m_propertyValueBag.releaseObject();
							this.m_propertyValueBag = null;
						}
						this.m_parent = null;
						this.m_jsonAttributes = null;
						this.m_leftSide = null;
						this.m_rightSide = null;
						this.m_condition = null;
						this.m_subnameToken = null;
						sap.firefly.TmxToken.$superclass.releaseObject
								.call(this);
					},
					getName : function() {
						return this.m_name;
					},
					setName : function(name) {
						this.m_name = name;
					},
					addChild : function(token) {
						this.m_children.add(token);
					},
					removeChild : function(token) {
						this.m_children.removeElement(token);
					},
					removeLastChild : function() {
						this.m_children.removeAt(this.m_children.size() - 1);
					},
					getChildren : function() {
						return this.m_children;
					},
					searchTokensByTypeRecursiv : function(type, token) {
						var tokens;
						var leftTokens;
						var leftSize;
						var i;
						var rightTokens;
						var rightSize;
						var n;
						if (token === null) {
							return null;
						}
						tokens = sap.firefly.XList.create();
						if (token.getType() === type) {
							tokens.add(token);
						}
						leftTokens = this.searchTokensByTypeRecursiv(type,
								token.getRightSide());
						if (leftTokens !== null) {
							leftSize = leftTokens.size();
							for (i = 0; i < leftSize; i++) {
								tokens.add(leftTokens.get(i));
							}
						}
						rightTokens = this.searchTokensByTypeRecursiv(type,
								token.getLeftSide());
						if (rightTokens !== null) {
							rightSize = rightTokens.size();
							for (n = 0; n < rightSize; n++) {
								tokens.add(rightTokens.get(n));
							}
						}
						return tokens;
					},
					searchNeighborTokensByType : function(type) {
						return this.searchTokensByTypeRecursiv(type, this);
					},
					getIndexOfChildByType : function(type) {
						var childrenSize = this.m_children.size();
						var i;
						for (i = 0; i < childrenSize; i++) {
							if (this.m_children.get(i).getType() === type) {
								return i;
							}
						}
						return -1;
					},
					getChildByType : function(type) {
						var childrenSize = this.m_children.size();
						var i;
						var tmxToken;
						for (i = 0; i < childrenSize; i++) {
							tmxToken = this.m_children.get(i);
							if (tmxToken.getType() === type) {
								return tmxToken;
							}
						}
						return null;
					},
					getType : function() {
						return this.m_tokenType;
					},
					setType : function(type) {
						this.m_tokenType = type;
					},
					getPosition : function() {
						return this.m_position;
					},
					setPosition : function(position) {
						this.m_position = position;
					},
					getJsonAttributes : function() {
						return this.m_jsonAttributes;
					},
					setJsonAttributes : function(jsonAttributes) {
						this.m_jsonAttributes = jsonAttributes;
					},
					getSubNameToken : function() {
						return this.m_subnameToken;
					},
					setSubNameToken : function(token) {
						this.m_subnameToken = token;
					},
					getLeftSide : function() {
						return this.m_leftSide;
					},
					setLeftSide : function(leftSide) {
						this.m_leftSide = leftSide;
						leftSide.setParent(this);
					},
					getRightSide : function() {
						return this.m_rightSide;
					},
					setRightSide : function(rightSide) {
						this.m_rightSide = rightSide;
						rightSide.setParent(this);
					},
					getCondition : function() {
						return this.m_condition;
					},
					setCondition : function(condition) {
						this.m_condition = condition;
					},
					getParent : function() {
						return sap.firefly.XWeakReferenceUtil
								.getHardRef(this.m_parent);
					},
					setParent : function(parent) {
						this.m_parent = sap.firefly.XWeakReferenceUtil
								.getWeakRef(parent);
					},
					getMainChild : function() {
						if (this.m_children.isEmpty()) {
							return null;
						}
						return this.m_children.get(0);
					},
					getStringValue : function() {
						var value = sap.firefly.TmxToken.$superclass.getStringValue
								.call(this);
						if (value === null) {
							return this.getName();
						}
						return value;
					},
					getLastChild : function() {
						var size = this.m_children.size();
						if (size === 0) {
							return null;
						}
						return this.m_children.get(size - 1);
					},
					isLeftChildOfParent : function() {
						var parent = this.getParent();
						if (parent === null) {
							return false;
						}
						return parent.getLeftSide().isEqualTo(this);
					},
					isRightChildOfParent : function() {
						var parent = this.getParent();
						if (parent === null) {
							return false;
						}
						return parent.getRightSide().isEqualTo(this);
					},
					getFirstChild : function() {
						if (this.m_children.isEmpty()) {
							return null;
						}
						return this.m_children.get(0);
					},
					getSecondChild : function() {
						if (this.m_children.size() > 1) {
							return this.m_children.get(1);
						}
						return null;
					},
					getThirdChild : function() {
						if (this.m_children.size() > 2) {
							return this.m_children.get(2);
						}
						return null;
					},
					toString : function() {
						return this.toStringExt(sap.firefly.TmxToken.DEBUG);
					},
					toStringExt : function(useOpBrackets) {
						var buffer = sap.firefly.XStringBuffer.create();
						var childrenSize;
						var isCommaEnumeration;
						var i;
						if ((this.m_leftSide !== null)
								|| (this.m_rightSide !== null)) {
							if (this.m_leftSide !== null) {
								if (useOpBrackets) {
									buffer.append("(");
								}
								buffer.append(this.m_leftSide
										.toStringExt(useOpBrackets));
								buffer.append(" ");
							}
							if (this.getCondition() !== null) {
								buffer.append(this.getCondition().getName());
								buffer.append(" ");
							}
							buffer.append(this.getName());
							if (this.m_rightSide !== null) {
								buffer.append(" ");
								buffer.append(this.m_rightSide
										.toStringExt(useOpBrackets));
								if (useOpBrackets) {
									buffer.append(")");
								}
							}
						} else {
							if (this.m_tokenType
									.isTypeOf(sap.firefly.TmxTokenType.BRACKETS)) {
								buffer.append(this.m_tokenType.getPrefix());
							} else {
								if (this.m_tokenType
										.isTypeOf(sap.firefly.TmxTokenType.TOKEN)) {
									if (this.getCondition() !== null) {
										buffer.append(this.getCondition()
												.getName());
										buffer.append(" ");
									}
									if (this.m_tokenType === sap.firefly.TmxTokenType.IDENTIFIER) {
										buffer.append("'");
										buffer.append(this.getName());
										buffer.append("'");
									} else {
										buffer.append(this.getName());
									}
									if (this.m_subnameToken !== null) {
										buffer.append(".");
										buffer.append(this.m_subnameToken
												.toString());
									}
									if (this.m_children.isEmpty() === false) {
										if (this.m_children
												.get(0)
												.getType()
												.isTypeOf(
														sap.firefly.TmxTokenType.BRACKETS) === false) {
											buffer.append(" ");
										}
									}
								}
							}
							childrenSize = this.m_children.size();
							isCommaEnumeration = this.m_tokenType
									.isCommaEnumeration();
							for (i = 0; i < childrenSize; i++) {
								if (i > 0) {
									if (isCommaEnumeration) {
										buffer.append(", ");
									} else {
										buffer.append(" ");
									}
								}
								buffer.append(this.m_children.get(i)
										.toStringExt(useOpBrackets));
							}
							if (this.m_tokenType
									.isTypeOf(sap.firefly.TmxTokenType.BRACKETS)) {
								buffer.append(this.m_tokenType.getPostfix());
							} else {
								if (this.m_tokenType
										.isTypeOf(sap.firefly.TmxTokenType.AXIS)) {
									if (this.m_tokenType !== sap.firefly.TmxTokenType.AXIS) {
										buffer.append(" on ");
										if (this.m_tokenType === sap.firefly.TmxTokenType.ROWS_AXIS) {
											buffer.append("rows");
										} else {
											buffer.append("columns");
										}
									}
								}
							}
						}
						if (this.m_jsonAttributes !== null) {
							buffer.append(sap.firefly.XString.replace(
									sap.firefly.PrToString.serialize(
											this.m_jsonAttributes, false,
											false, 0), '"', "'"));
						}
						return buffer.toString();
					},
					getPropertyValueBag : function() {
						return this.m_propertyValueBag;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.TmxTokenType",
				sap.firefly.XConstantWithParent,
				{
					$statics : {
						GENERIC : null,
						VIRTUAL : null,
						TOKEN : null,
						ROOT : null,
						QUERY : null,
						LANGUAGE : null,
						IDENTIFIER : null,
						STRING : null,
						NUMBER : null,
						DATE : null,
						DATETIME : null,
						CURRENCY : null,
						UNIT : null,
						NAME : null,
						KEYWORD : null,
						SEPARATOR : null,
						EXPRESSION_SEPARATOR : null,
						DOT_SEPARATOR : null,
						BLOCK_KEYWORD : null,
						SELECT : null,
						ON : null,
						AXIS : null,
						COLUMN_AXIS : null,
						ROWS_AXIS : null,
						FREE_AXIS : null,
						ROWS : null,
						COLUMNS : null,
						FREE : null,
						MEASURES : null,
						ACCOUNT : null,
						VERSION : null,
						WHERE : null,
						MEMBERS : null,
						IN : null,
						_TRUE : null,
						_FALSE : null,
						BRACKETS : null,
						ROUND_BRACKETS : null,
						ROUND_BRACKETS_LIST : null,
						SQUARE_BRACKETS : null,
						ORDER : null,
						BY : null,
						ASC : null,
						DESC : null,
						DATACELL : null,
						COMPLEX : null,
						TEXT : null,
						KEY : null,
						FILTER : null,
						HIERARCHY : null,
						SORT_ITEM : null,
						SORT_FUNCTION : null,
						ORDER_BY : null,
						BREAK : null,
						OPERATOR : null,
						OP_EQUAL : null,
						OP_NOT_EQUAL : null,
						OP_LESS : null,
						OP_LESS_EQUAL : null,
						OP_GREATER : null,
						OP_GREATER_EQUAL : null,
						OP_AND : null,
						OP_OR : null,
						OP_ASSIGN : null,
						OP_ASSIGN_DEF : null,
						OP_ASSIGN_PROP : null,
						OP_PLUS : null,
						OP_MINUS : null,
						OP_DIV : null,
						OP_MULT : null,
						FUNCTION : null,
						CONDITION : null,
						NOT : null,
						OFFSET : null,
						OFFSET_FROM : null,
						OFFSET_TO : null,
						TOTAL : null,
						ALL : null,
						TMX_FUNCTION : null,
						MAKEDATETIME : null,
						MAKEDATETIME_SAP : null,
						MAKECURRENCY : null,
						MAKEUNIT : null,
						MAKEDATE : null,
						MAKEDATE_SAP : null,
						DAYOFDATE : null,
						YEAROFDATE : null,
						MONTHOFDATE : null,
						QUARTEROFDATE : null,
						NOW : null,
						UCASE : null,
						LCASE : null,
						REPLACE : null,
						s_lookupNames : null,
						ADD_LOOKUP_NAMES : true,
						IS_COMMA_ENUM : true,
						HAS_PRE_POSTFIX : true,
						CAN_HAVE_SQUARE_BRACKET : true,
						staticSetup : function() {
							sap.firefly.TmxTokenType.s_lookupNames = sap.firefly.XHashMapByString
									.create();
							sap.firefly.TmxTokenType.GENERIC = sap.firefly.TmxTokenType
									.create("Generic", null, false);
							sap.firefly.TmxTokenType.VIRTUAL = sap.firefly.TmxTokenType
									.create("Virtual",
											sap.firefly.TmxTokenType.GENERIC,
											false);
							sap.firefly.TmxTokenType.TOKEN = sap.firefly.TmxTokenType
									.create("Token",
											sap.firefly.TmxTokenType.GENERIC,
											false);
							sap.firefly.TmxTokenType.ROOT = sap.firefly.TmxTokenType
									.create("Root",
											sap.firefly.TmxTokenType.VIRTUAL,
											false);
							sap.firefly.TmxTokenType.QUERY = sap.firefly.TmxTokenType
									.create("Query",
											sap.firefly.TmxTokenType.VIRTUAL,
											false);
							sap.firefly.TmxTokenType.LANGUAGE = sap.firefly.TmxTokenType
									.create("Language",
											sap.firefly.TmxTokenType.VIRTUAL,
											false);
							sap.firefly.TmxTokenType.IDENTIFIER = sap.firefly.TmxTokenType
									.createExt(
											"Identifier",
											sap.firefly.TmxTokenType.TOKEN,
											false,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.STRING = sap.firefly.TmxTokenType
									.createExt(
											"String",
											sap.firefly.TmxTokenType.TOKEN,
											false,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.NUMBER = sap.firefly.TmxTokenType
									.create("Number",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.DATE = sap.firefly.TmxTokenType
									.create("Date",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.DATETIME = sap.firefly.TmxTokenType
									.create("DateTime",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.CURRENCY = sap.firefly.TmxTokenType
									.create("Currency",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.UNIT = sap.firefly.TmxTokenType
									.create("Unit",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.NAME = sap.firefly.TmxTokenType
									.createExt(
											"Name",
											sap.firefly.TmxTokenType.TOKEN,
											false,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.KEYWORD = sap.firefly.TmxTokenType
									.create("Keyword",
											sap.firefly.TmxTokenType.NAME,
											false);
							sap.firefly.TmxTokenType.BLOCK_KEYWORD = sap.firefly.TmxTokenType
									.create("BlockKeyword",
											sap.firefly.TmxTokenType.KEYWORD,
											false);
							sap.firefly.TmxTokenType.SEPARATOR = sap.firefly.TmxTokenType
									.create(",",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.EXPRESSION_SEPARATOR = sap.firefly.TmxTokenType
									.create(";",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.DOT_SEPARATOR = sap.firefly.TmxTokenType
									.create(".",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.BRACKETS = sap.firefly.TmxTokenType
									.create("({[]})",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.ROUND_BRACKETS = sap.firefly.TmxTokenType
									.createExt(
											"()",
											sap.firefly.TmxTokenType.BRACKETS,
											false,
											false,
											null,
											sap.firefly.TmxTokenType.HAS_PRE_POSTFIX,
											false);
							sap.firefly.TmxTokenType.ROUND_BRACKETS_LIST = sap.firefly.TmxTokenType
									.createExt(
											"()",
											sap.firefly.TmxTokenType.ROUND_BRACKETS,
											false,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null,
											sap.firefly.TmxTokenType.HAS_PRE_POSTFIX,
											false);
							sap.firefly.TmxTokenType.SQUARE_BRACKETS = sap.firefly.TmxTokenType
									.createExt(
											"[]",
											sap.firefly.TmxTokenType.BRACKETS,
											false,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null,
											sap.firefly.TmxTokenType.HAS_PRE_POSTFIX,
											false);
							sap.firefly.TmxTokenType.SELECT = sap.firefly.TmxTokenType
									.createExt(
											"select",
											sap.firefly.TmxTokenType.BLOCK_KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null, false, false);
							sap.firefly.TmxTokenType.WHERE = sap.firefly.TmxTokenType
									.createExt(
											"where",
											sap.firefly.TmxTokenType.BLOCK_KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false, null, false, false);
							sap.firefly.TmxTokenType.MEMBERS = sap.firefly.TmxTokenType
									.createExt(
											"members",
											sap.firefly.TmxTokenType.BLOCK_KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null, false, false);
							sap.firefly.TmxTokenType.ORDER_BY = sap.firefly.TmxTokenType
									.createExt(
											"order by",
											sap.firefly.TmxTokenType.BLOCK_KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null, false, false);
							sap.firefly.TmxTokenType.TMX_FUNCTION = sap.firefly.TmxTokenType
									.createExt(
											"~",
											sap.firefly.TmxTokenType.BLOCK_KEYWORD,
											false, false, null, false, false);
							sap.firefly.TmxTokenType.DAYOFDATE = sap.firefly.TmxTokenType
									.createExt(
											"~dayofdate",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.YEAROFDATE = sap.firefly.TmxTokenType
									.createExt(
											"~yearofdate",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.MONTHOFDATE = sap.firefly.TmxTokenType
									.createExt(
											"~monthofdate",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.NOW = sap.firefly.TmxTokenType
									.createExt(
											"~now",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.QUARTEROFDATE = sap.firefly.TmxTokenType
									.createExt(
											"~quarterofdate",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.MAKEDATE = sap.firefly.TmxTokenType
									.createExt(
											"~makedate",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.MAKEDATE_SAP = sap.firefly.TmxTokenType
									.createExt(
											"~makedate_sap",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.MAKEDATETIME = sap.firefly.TmxTokenType
									.createExt(
											"~makedatetime",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.MAKEDATETIME_SAP = sap.firefly.TmxTokenType
									.createExt(
											"~makedatetime_sap",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.UCASE = sap.firefly.TmxTokenType
									.createExt(
											"~ucase",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.LCASE = sap.firefly.TmxTokenType
									.createExt(
											"~lcase",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.REPLACE = sap.firefly.TmxTokenType
									.createExt(
											"~replace",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.MAKECURRENCY = sap.firefly.TmxTokenType
									.createExt(
											"~makecurrency",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.MAKEUNIT = sap.firefly.TmxTokenType
									.createExt(
											"~makeunit",
											sap.firefly.TmxTokenType.TMX_FUNCTION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.OFFSET = sap.firefly.TmxTokenType
									.createExt(
											"offset",
											sap.firefly.TmxTokenType.BLOCK_KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null, false, false);
							sap.firefly.TmxTokenType.OFFSET_FROM = sap.firefly.TmxTokenType
									.create("OffsetFrom",
											sap.firefly.TmxTokenType.NUMBER,
											false);
							sap.firefly.TmxTokenType.OFFSET_TO = sap.firefly.TmxTokenType
									.create("OffsetTo",
											sap.firefly.TmxTokenType.NUMBER,
											false);
							sap.firefly.TmxTokenType.ON = sap.firefly.TmxTokenType
									.create(
											"on",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.ROWS = sap.firefly.TmxTokenType
									.create(
											"rows",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.COLUMNS = sap.firefly.TmxTokenType
									.create(
											"columns",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.FREE = sap.firefly.TmxTokenType
									.create(
											"free",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.AXIS = sap.firefly.TmxTokenType
									.createExt(
											"VirtualAxis",
											sap.firefly.TmxTokenType.VIRTUAL,
											false,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null, false, false);
							sap.firefly.TmxTokenType.COLUMN_AXIS = sap.firefly.TmxTokenType
									.createExt(
											"ColumnAxis",
											sap.firefly.TmxTokenType.AXIS,
											false,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null, false, false);
							sap.firefly.TmxTokenType.ROWS_AXIS = sap.firefly.TmxTokenType
									.createExt(
											"RowsAxis",
											sap.firefly.TmxTokenType.AXIS,
											false,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null, false, false);
							sap.firefly.TmxTokenType.FREE_AXIS = sap.firefly.TmxTokenType
									.createExt(
											"FreeAxis",
											sap.firefly.TmxTokenType.AXIS,
											false,
											sap.firefly.TmxTokenType.IS_COMMA_ENUM,
											null, false, false);
							sap.firefly.TmxTokenType.MEASURES = sap.firefly.TmxTokenType
									.createExt(
											"measures",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.ACCOUNT = sap.firefly.TmxTokenType
									.createExt(
											"account",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.VERSION = sap.firefly.TmxTokenType
									.createExt(
											"version",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType._TRUE = sap.firefly.TmxTokenType
									.create(
											"true",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType._FALSE = sap.firefly.TmxTokenType
									.create(
											"false",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.ORDER = sap.firefly.TmxTokenType
									.create(
											"order",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.BY = sap.firefly.TmxTokenType
									.create(
											"by",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.BREAK = sap.firefly.TmxTokenType
									.create(
											"break",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.ASC = sap.firefly.TmxTokenType
									.create(
											"asc",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.DESC = sap.firefly.TmxTokenType
									.create(
											"desc",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.FILTER = sap.firefly.TmxTokenType
									.create(
											"filter",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.HIERARCHY = sap.firefly.TmxTokenType
									.create(
											"hierarchy",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.SORT_ITEM = sap.firefly.TmxTokenType
									.create("sortItem",
											sap.firefly.TmxTokenType.VIRTUAL,
											false);
							sap.firefly.TmxTokenType.SORT_FUNCTION = sap.firefly.TmxTokenType
									.createExt("SortFunction",
											sap.firefly.TmxTokenType.TOKEN,
											false, false, null, false, false);
							sap.firefly.TmxTokenType.DATACELL = sap.firefly.TmxTokenType
									.createExt(
											"datacell",
											sap.firefly.TmxTokenType.SORT_FUNCTION,
											true,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.COMPLEX = sap.firefly.TmxTokenType
									.createExt(
											"complex",
											sap.firefly.TmxTokenType.SORT_FUNCTION,
											true,
											false,
											null,
											false,
											sap.firefly.TmxTokenType.CAN_HAVE_SQUARE_BRACKET);
							sap.firefly.TmxTokenType.TOTAL = sap.firefly.TmxTokenType
									.create(
											"total",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.ALL = sap.firefly.TmxTokenType
									.create(
											"all",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.TEXT = sap.firefly.TmxTokenType
									.create(
											"text",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.KEY = sap.firefly.TmxTokenType
									.create(
											"key",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.BY.m_firstElement = sap.firefly.TmxTokenType.ORDER;
							sap.firefly.TmxTokenType.BY.m_convertedElement = sap.firefly.TmxTokenType.ORDER_BY;
							sap.firefly.TmxTokenType.CONDITION = sap.firefly.TmxTokenType
									.create(
											"Condition",
											sap.firefly.TmxTokenType.KEYWORD,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.NOT = sap.firefly.TmxTokenType
									.create(
											"not",
											sap.firefly.TmxTokenType.CONDITION,
											sap.firefly.TmxTokenType.ADD_LOOKUP_NAMES);
							sap.firefly.TmxTokenType.OPERATOR = sap.firefly.TmxTokenType
									.create("VirtualOperator",
											sap.firefly.TmxTokenType.TOKEN,
											false);
							sap.firefly.TmxTokenType.OP_EQUAL = sap.firefly.TmxTokenType
									.createOperator(
											"==",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.ComparisonOperator.EQUAL);
							sap.firefly.TmxTokenType.OP_NOT_EQUAL = sap.firefly.TmxTokenType
									.createOperator(
											"!=",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.ComparisonOperator.NOT_EQUAL);
							sap.firefly.TmxTokenType.OP_LESS = sap.firefly.TmxTokenType
									.createOperator(
											"<",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.ComparisonOperator.LESS_THAN);
							sap.firefly.TmxTokenType.OP_LESS_EQUAL = sap.firefly.TmxTokenType
									.createOperator(
											"<=",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.ComparisonOperator.LESS_EQUAL);
							sap.firefly.TmxTokenType.OP_GREATER = sap.firefly.TmxTokenType
									.createOperator(
											">",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.ComparisonOperator.GREATER_THAN);
							sap.firefly.TmxTokenType.OP_GREATER_EQUAL = sap.firefly.TmxTokenType
									.createOperator(
											">=",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.ComparisonOperator.GREATER_EQUAL);
							sap.firefly.TmxTokenType.OP_AND = sap.firefly.TmxTokenType
									.createOperator("&&",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.LogicalBoolOperator.AND);
							sap.firefly.TmxTokenType.OP_OR = sap.firefly.TmxTokenType
									.createOperator("||",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.LogicalBoolOperator.OR);
							sap.firefly.TmxTokenType.IN = sap.firefly.TmxTokenType
									.createOperator("in",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.ComparisonOperator.IN);
							sap.firefly.TmxTokenType.OP_ASSIGN = sap.firefly.TmxTokenType
									.createOperator("=",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.AssignOperator.ASSIGN);
							sap.firefly.TmxTokenType.OP_ASSIGN_DEF = sap.firefly.TmxTokenType
									.createOperator(
											"=:",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.AssignOperator.ASSIGN_DEF);
							sap.firefly.TmxTokenType.OP_ASSIGN_PROP = sap.firefly.TmxTokenType
									.createOperator(
											"=>",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.AssignOperator.ASSIGN_PROP);
							sap.firefly.TmxTokenType.OP_PLUS = sap.firefly.TmxTokenType
									.createOperator("+",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.MathOperator.PLUS);
							sap.firefly.TmxTokenType.OP_MINUS = sap.firefly.TmxTokenType
									.createOperator("-",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.MathOperator.MINUS);
							sap.firefly.TmxTokenType.OP_MULT = sap.firefly.TmxTokenType
									.createOperator("*",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.MathOperator.MULT);
							sap.firefly.TmxTokenType.OP_DIV = sap.firefly.TmxTokenType
									.createOperator("/",
											sap.firefly.TmxTokenType.OPERATOR,
											sap.firefly.MathOperator.DIV);
							sap.firefly.TmxTokenType.FUNCTION = sap.firefly.TmxTokenType
									.createExt("function",
											sap.firefly.TmxTokenType.TOKEN,
											false, true, null, false, false);
						},
						createOperator : function(name, parent, op) {
							return sap.firefly.TmxTokenType.createExt(name,
									parent, true, false, op, false, false);
						},
						create : function(name, parent, addLookupNames) {
							return sap.firefly.TmxTokenType.createExt(name,
									parent, addLookupNames, false, null, false,
									false);
						},
						createExt : function(name, parent, addLookupNames,
								isCommaEnumeration, op, hasPrePostfix,
								canHaveSquareBrackets) {
							var object = new sap.firefly.TmxTokenType();
							object.setupConstant(name);
							object.setParent(parent);
							object.m_isCommaEnumeration = isCommaEnumeration;
							object.m_operator = op;
							object.m_canHaveSquareBrackets = canHaveSquareBrackets;
							if (hasPrePostfix) {
								object.m_prefix = sap.firefly.XString
										.substring(name, 0, 1);
								object.m_postfix = sap.firefly.XString
										.substring(name, 1, 2);
							}
							if (addLookupNames) {
								sap.firefly.TmxTokenType.s_lookupNames.put(
										name, object);
							}
							return object;
						},
						lookupName : function(name) {
							return sap.firefly.TmxTokenType.s_lookupNames
									.getByKey(name);
						}
					},
					m_isCommaEnumeration : false,
					m_canHaveSquareBrackets : false,
					m_operator : null,
					m_prefix : null,
					m_postfix : null,
					m_firstElement : null,
					m_convertedElement : null,
					isCommaEnumeration : function() {
						return this.m_isCommaEnumeration;
					},
					canHaveSquareBrackets : function() {
						return this.m_canHaveSquareBrackets;
					},
					getOperator : function() {
						return this.m_operator;
					},
					getPrefix : function() {
						return this.m_prefix;
					},
					getPostfix : function() {
						return this.m_postfix;
					},
					getFirstElement : function() {
						return this.m_firstElement;
					},
					getConvertedElement : function() {
						return this.m_convertedElement;
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QCmdAbstract",
				sap.firefly.XObject,
				{
					$statics : {
						castParentToCartesianList : function(filterOp) {
							var parent;
							if (filterOp !== null) {
								parent = filterOp.getParent();
								if ((parent !== null)
										&& (parent.getComponentType() === sap.firefly.FilterComponentType.CARTESIAN_LIST)) {
									return parent;
								}
							}
							return null;
						}
					},
					clearSelections : function() {
						this.clearFilters();
					},
					clearSelectionsNotAffectedByVariables : function() {
						this.clearFiltersNotAffectedByVariables();
					},
					clearSelectionsNotCreatedByVariables : function() {
						this.clearFiltersNotCreatedByVariables();
					},
					clearVisibilitySelections : function() {
						this.clearVisibilityFilters();
					},
					clearSelectionsByDimension : function(dimension) {
						this.clearFiltersByDimension(dimension);
					},
					clearVisibilitySelectionsByDimension : function(dimension) {
						this.clearVisibilityFiltersByDimension(dimension);
					},
					clearSelectionsByDimensionName : function(dimensionName) {
						this.clearFiltersByDimensionName(dimensionName);
					},
					clearVisibilitySelectionsByDimensionName : function(
							dimensionName) {
						this
								.clearVisibilityFiltersByDimensionName(dimensionName);
					},
					clearMeasureSelections : function() {
						this.clearMeasureFilters();
					},
					removeSingleMemberSelectionByName : function(dimensionName,
							memberName, comparisonOperator) {
						this.clearSingleMemberFilterByName(dimensionName,
								memberName, comparisonOperator);
					},
					removeSingleMemberSelectionByDimension : function(
							dimension, memberName, comparisonOperator) {
						this.clearSingleMemberFilterByDimension(dimension,
								memberName, comparisonOperator);
					},
					removeSingleMemberSelectionByMember : function(member,
							comparisonOperator) {
						this
								.clearSingleMemberFilter(member,
										comparisonOperator);
					},
					removeFilterById : function(uniqueId) {
						this.clearFilterById(uniqueId);
					},
					removeVisibilityFilterById : function(uniqueId) {
						this.clearVisibilityFilterById(uniqueId);
					},
					clearSingleMemberFilterByDimension : function(dimension,
							memberName, comparisonOperator) {
						if (dimension !== null) {
							return this.clearSingleMemberFilterByName(dimension
									.getName(), memberName, comparisonOperator);
						}
						return this;
					},
					clearSingleMemberFilter : function(member,
							comparisonOperator) {
						var dimName;
						if (member !== null) {
							dimName = member.getDimension().getName();
							return this.clearSingleMemberFilterByName(dimName,
									member.getName(), comparisonOperator);
						}
						return this;
					},
					addSimpleSingleMemberSelection : function(dimensionName,
							memberName) {
						return this.addSimpleSingleMemberFilter(dimensionName,
								memberName);
					},
					addSingleMemberSelectionByDimensionName : function(
							dimensionName, memberName, comparisonOperator) {
						return this.addSingleMemberFilterByDimensionName(
								dimensionName, memberName, comparisonOperator);
					},
					addSingleMemberVisibilitySelectionByDimensionName : function(
							dimensionName, memberName, comparisonOperator) {
						return this
								.addSingleMemberVisibilityFilterByDimensionName(
										dimensionName, memberName,
										comparisonOperator);
					},
					addSingleMemberSelectionByDimension : function(dimension,
							memberName, comparisonOperator) {
						return this.addSingleMemberFilterByDimension(dimension,
								memberName, comparisonOperator);
					},
					addSingleMemberVisibilitySelectionByDimension : function(
							dimension, memberName, comparisonOperator) {
						return this.addSingleMemberVisibilityFilterByDimension(
								dimension, memberName, comparisonOperator);
					},
					addSingleMemberVisibilityFilterByDimension : function(
							dimension, memberName, comparisonOperator) {
						if (dimension !== null) {
							return this
									.addSingleMemberVisibilityFilterByDimensionName(
											dimension.getName(), memberName,
											comparisonOperator);
						}
						return null;
					},
					addSingleMemberFilterByDimension : function(dimension,
							memberName, comparisonOperator) {
						if (dimension !== null) {
							return this.addSingleMemberFilterByDimensionName(
									dimension.getName(), memberName,
									comparisonOperator);
						}
						return null;
					},
					clearFilters : function() {
						return this.clearAllFiltersExt(
								sap.firefly.FilterLayer.DYNAMIC,
								sap.firefly.FilterScopeVariables.IGNORE);
					},
					clearVisibilityFilters : function() {
						return this.clearAllFiltersExt(
								sap.firefly.FilterLayer.VISIBILITY,
								sap.firefly.FilterScopeVariables.IGNORE);
					},
					clearFiltersNotAffectedByVariables : function() {
						return this
								.clearAllFiltersExt(
										sap.firefly.FilterLayer.DYNAMIC,
										sap.firefly.FilterScopeVariables.NOT_AFFECTED_BY_VARIABLES);
					},
					clearFiltersNotCreatedByVariables : function() {
						return this
								.clearAllFiltersExt(
										sap.firefly.FilterLayer.DYNAMIC,
										sap.firefly.FilterScopeVariables.NOT_CREATED_BY_VARIABLES);
					},
					clearMeasureFilters : function() {
						return this.clearFiltersByDimensionExt(
								sap.firefly.FilterLayer.DYNAMIC,
								sap.firefly.DimensionType.MEASURE_STRUCTURE,
								null);
					},
					clearFiltersByDimensionName : function(dimName) {
						return this.clearFiltersByDimensionExt(
								sap.firefly.FilterLayer.DYNAMIC, null, dimName);
					},
					clearVisibilityFiltersByDimensionName : function(dimName) {
						return this.clearFiltersByDimensionExt(
								sap.firefly.FilterLayer.VISIBILITY, null,
								dimName);
					},
					clearFiltersByDimension : function(dimension) {
						if (dimension !== null) {
							return this.clearFiltersByDimensionExt(
									sap.firefly.FilterLayer.DYNAMIC, null,
									dimension.getName());
						}
						return this;
					},
					clearVisibilityFiltersByDimension : function(dimension) {
						if (dimension !== null) {
							return this.clearFiltersByDimensionExt(
									sap.firefly.FilterLayer.VISIBILITY, null,
									dimension.getName());
						}
						return this;
					},
					clearFilterById : function(uniqueId) {
						return this.clearFilterByIdExt(
								sap.firefly.FilterLayer.DYNAMIC, uniqueId);
					},
					clearVisibilityFilterById : function(uniqueId) {
						return this.clearFilterByIdExt(
								sap.firefly.FilterLayer.VISIBILITY, uniqueId);
					},
					addSimpleSingleMemberFilter : function(dimName, memberName) {
						return this.addSingleMemberSelectionByDimensionName(
								dimName, memberName,
								sap.firefly.ComparisonOperator.EQUAL);
					},
					addSingleMeasureFilter : function(measureName) {
						return this.addSingleMemberFilter(
								sap.firefly.FilterLayer.DYNAMIC,
								sap.firefly.DimensionType.MEASURE_STRUCTURE,
								null, measureName,
								sap.firefly.ComparisonOperator.EQUAL);
					},
					addSingleMeasureVisibilityFilter : function(measureName) {
						return this.addSingleMemberFilter(
								sap.firefly.FilterLayer.VISIBILITY,
								sap.firefly.DimensionType.MEASURE_STRUCTURE,
								null, measureName,
								sap.firefly.ComparisonOperator.EQUAL);
					},
					addSingleStructureMemberFilterByType : function(
							structureType, structureMemberName,
							comparisonOperator) {
						return this.addSingleMemberFilter(
								sap.firefly.FilterLayer.DYNAMIC, structureType,
								null, structureMemberName, comparisonOperator);
					},
					addSingleStructureMemberVisibilityFilterByType : function(
							structureType, structureMemberName,
							comparisonOperator) {
						return this.addSingleMemberFilter(
								sap.firefly.FilterLayer.VISIBILITY,
								structureType, null, structureMemberName,
								comparisonOperator);
					},
					addSingleMemberFilterByDimensionMember : function(
							dimensionMember, comparisonOperator) {
						return this.addSingleMemberFilter(
								sap.firefly.FilterLayer.DYNAMIC, null,
								dimensionMember.getDimension().getName(),
								dimensionMember.getName(), comparisonOperator);
					},
					addSingleMemberVisibilityFilterByDimensionMember : function(
							dimensionMember, comparisonOperator) {
						return this.addSingleMemberFilter(
								sap.firefly.FilterLayer.VISIBILITY, null,
								dimensionMember.getDimension().getName(),
								dimensionMember.getName(), comparisonOperator);
					},
					addSingleMemberFilterByDimensionName : function(dimName,
							memberName, comparisonOperator) {
						return this.addSingleMemberFilter(
								sap.firefly.FilterLayer.DYNAMIC, null, dimName,
								memberName, comparisonOperator);
					},
					addSingleMemberVisibilityFilterByDimensionName : function(
							dimName, memberName, comparisonOperator) {
						return this.addSingleMemberFilter(
								sap.firefly.FilterLayer.VISIBILITY, null,
								dimName, memberName, comparisonOperator);
					},
					addSingleStructureMemberSelectionByType : function(
							structureType, structureMemberName,
							comparisonOperator) {
						return this.addSingleStructureMemberFilterByType(
								structureType, structureMemberName,
								comparisonOperator);
					},
					addSingleStructureMemberVisibilitySelectionByType : function(
							structureType, structureMemberName,
							comparisonOperator) {
						return this
								.addSingleStructureMemberVisibilityFilterByType(
										structureType, structureMemberName,
										comparisonOperator);
					},
					addSingleMeasureSelection : function(measureName) {
						return this.addSingleMeasureFilter(measureName);
					},
					addSingleMeasureVisibilitySelection : function(measureName) {
						return this
								.addSingleMeasureVisibilityFilter(measureName);
					},
					addSingleMemberSelectionByDimensionMember : function(
							dimensionMember, comparisonOperator) {
						return this.addSingleMemberFilterByDimensionMember(
								dimensionMember, comparisonOperator);
					},
					addSingleNodeSelection : function(node, comparisonOperator) {
						return this.addSingleNodeFilter(node,
								comparisonOperator);
					},
					addSingleMemberVisibilitySelectionByDimensionMember : function(
							dimensionMember, comparisonOperator) {
						return this
								.addSingleMemberVisibilityFilterByDimensionMember(
										dimensionMember, comparisonOperator);
					},
					addStringSelectionByField : function(field, filterValue,
							comparisonOperator) {
						return this.addStringFilterByField(field, filterValue,
								comparisonOperator);
					},
					addSelectionByFieldAndValue : function(field, filterValue,
							comparisonOperator) {
						return this.addFilterByFieldAndValue(field,
								filterValue, comparisonOperator);
					},
					addStringSelectionByFieldNameAndOperator : function(
							dimensionName, fieldName, filterValue,
							comparisonOperator) {
						return this.addStringFilterByFieldNameAndOperator(
								dimensionName, fieldName, filterValue,
								comparisonOperator);
					},
					addIntSelectionByFieldName : function(dimensionName,
							fieldName, filterValue, comparisonOperator) {
						return this.addIntFilterByFieldName(dimensionName,
								fieldName, filterValue, comparisonOperator);
					},
					addIntSelectionByField : function(field, filterValue,
							comparisonOperator) {
						return this.addIntFilterByField(field, filterValue,
								comparisonOperator);
					},
					addDoubleSelectionByFieldName : function(dimensionName,
							fieldName, filterValue, comparisonOperator) {
						return this.addDoubleFilterByFieldName(dimensionName,
								fieldName, filterValue, comparisonOperator);
					},
					addDoubleSelectionByField : function(field, filterValue,
							comparisonOperator) {
						return this.addDoubleFilterByField(field, filterValue,
								comparisonOperator);
					},
					addLongSelectionByFieldName : function(dimensionName,
							fieldName, filterValue, comparisonOperator) {
						return this.addLongFilterByFieldName(dimensionName,
								fieldName, filterValue, comparisonOperator);
					},
					addLongSelectionByField : function(field, filterValue,
							comparisonOperator) {
						return this.addLongFilterByField(field, filterValue,
								comparisonOperator);
					},
					addStringSelectionByName : function(dimensionName,
							fieldName, filterValue, comparisonOperator) {
						return this.addStringFilterByName(dimensionName,
								fieldName, filterValue, comparisonOperator);
					},
					addStringSelectionByPresentation : function(dimensionName,
							presentationType, filterValue, comparisonOperator) {
						return this.addStringFilterByPresentation(
								dimensionName, presentationType, filterValue,
								comparisonOperator);
					},
					addIntervallSelectionByStringValues : function(
							dimensionName, lowValue, highValue) {
						return this.addIntervallFilterByStringValues(
								dimensionName, lowValue, highValue);
					},
					addIntervallVisibilitySelectionByStringValues : function(
							dimensionName, lowValue, highValue) {
						return this.addIntervallVisibilityFilterByStringValues(
								dimensionName, lowValue, highValue);
					},
					addIntervallSelectionByIntegerValues : function(
							dimensionName, lowValue, highValue) {
						return this.addIntervallFilterByIntegerValues(
								dimensionName, lowValue, highValue);
					},
					addIntervallSelectionByLongValues : function(dimensionName,
							lowValue, highValue) {
						return this.addIntervallFilterByLongValues(
								dimensionName, lowValue, highValue);
					},
					addIntervallSelectionByValues : function(dimensionName,
							lowValue, highValue) {
						return this.addIntervallFilterByValues(dimensionName,
								lowValue, highValue);
					},
					addWithinDistanceSelection : function(dimension, fieldName,
							point, distance, unit) {
						return this.addWithinDistanceFilter(dimension,
								fieldName, point, distance, unit);
					},
					addSelectionByField : function(field, firstValue,
							secondValue, thirdValue, comparisonOperator,
							isVisibility) {
						return this.addFilterByField(field, firstValue,
								secondValue, thirdValue, comparisonOperator,
								isVisibility);
					},
					addIntersectsRectSelection : function(dimension, fieldName,
							lowerLeft, upperRight) {
						return this.addIntersectsRectFilter(dimension,
								fieldName, lowerLeft, upperRight);
					},
					addContainsGeometrySelection : function(dimension,
							fieldName, geometry) {
						return this.addContainsGeometryFilter(dimension,
								fieldName, geometry);
					},
					addIntersectsGeometrySelection : function(dimension,
							fieldName, geometry) {
						return this.addIntersectsGeometryFilter(dimension,
								fieldName, geometry);
					},
					addCoversGeometrySelection : function(dimension, fieldName,
							geometry) {
						return this.addCoversGeometryFilter(dimension,
								fieldName, geometry);
					},
					addCrossesLinestringSelection : function(dimension,
							fieldName, geometry) {
						return this.addCrossesLinestringFilter(dimension,
								fieldName, geometry);
					},
					addDisjointGeometrySelection : function(dimension,
							fieldName, geometry) {
						return this.addDisjointGeometryFilter(dimension,
								fieldName, geometry);
					},
					addOverlapsGeometrySelection : function(dimension,
							fieldName, geometry) {
						return this.addOverlapsGeometryFilter(dimension,
								fieldName, geometry);
					},
					addTouchesGeometrySelection : function(dimension,
							fieldName, geometry) {
						return this.addTouchesGeometryFilter(dimension,
								fieldName, geometry);
					},
					addWithinGeometrySelection : function(dimension, fieldName,
							geometry) {
						return this.addWithinGeometryFilter(dimension,
								fieldName, geometry);
					},
					addIntervallFilterByIntegerValues : function(dimensionName,
							lowValue, highValue) {
						return this.addIntervallFilterByStringValues(
								dimensionName, sap.firefly.XInteger
										.convertIntegerToString(lowValue),
								sap.firefly.XInteger
										.convertIntegerToString(highValue));
					},
					addIntervallFilterByLongValues : function(dimensionName,
							lowValue, highValue) {
						return this.addIntervallFilterByStringValues(
								dimensionName, sap.firefly.XLong
										.convertLongToString(lowValue),
								sap.firefly.XLong
										.convertLongToString(highValue));
					},
					addIntervallFilterByStringValues : function(dimensionName,
							lowValue, highValue) {
						var filterOp = this.addFilter(
								sap.firefly.FilterLayer.DYNAMIC, null,
								dimensionName, null, null, lowValue, highValue,
								sap.firefly.ComparisonOperator.BETWEEN);
						return sap.firefly.QCmdAbstract
								.castParentToCartesianList(filterOp);
					},
					addIntervallVisibilityFilterByStringValues : function(
							dimensionName, lowValue, highValue) {
						var filterOp = this.addFilter(
								sap.firefly.FilterLayer.VISIBILITY, null,
								dimensionName, null, null, lowValue, highValue,
								sap.firefly.ComparisonOperator.BETWEEN);
						return sap.firefly.QCmdAbstract
								.castParentToCartesianList(filterOp);
					},
					moveDimensionToRows : function(dimName) {
						return this.moveDimensionToAxis(dimName,
								sap.firefly.AxisType.ROWS);
					},
					moveDimensionToColumns : function(dimName) {
						return this.moveDimensionToAxis(dimName,
								sap.firefly.AxisType.COLUMNS);
					},
					moveDimensionToFree : function(dimName) {
						return this.moveDimensionToAxis(dimName,
								sap.firefly.AxisType.FREE);
					},
					moveMeasureDimensionToAxis : function(targetAxis) {
						return this.moveDimensionByTypeToAxis(
								sap.firefly.DimensionType.MEASURE_STRUCTURE,
								targetAxis);
					},
					moveDimensionByTypeToAxis : function(dimType, targetAxis) {
						return this.moveDimensionExt(dimType, null, targetAxis,
								-1);
					},
					moveDimensionToAxisByIndex : function(dimName, targetAxis,
							index) {
						return this.moveDimensionExt(null, dimName, targetAxis,
								index);
					},
					moveDimensionToAxis : function(dimName, targetAxis) {
						return this.moveDimensionExt(null, dimName, targetAxis,
								-1);
					},
					addDimension : function(dimName) {
						return this.moveDimensionExt(null, dimName,
								sap.firefly.AxisType.ROWS, -1);
					},
					addAllDimensionFieldsToResultSet : function() {
						return this
								.addAllFieldsToModelArea(sap.firefly.QContextType.RESULT_SET);
					},
					addAllDimensionFieldsToSelector : function() {
						return this
								.addAllFieldsToModelArea(sap.firefly.QContextType.SELECTOR);
					},
					clearAllDimensionFieldsFromResultSet : function() {
						return this
								.clearAllFieldsFromModelArea(sap.firefly.QContextType.RESULT_SET);
					},
					clearAllDimensionFieldsFromSelector : function() {
						return this
								.clearAllFieldsFromModelArea(sap.firefly.QContextType.SELECTOR);
					},
					addAllFieldsToResultSet : function(dimName) {
						return this.addAllFieldsOfDimensionToModelArea(dimName,
								sap.firefly.QContextType.RESULT_SET);
					},
					addAllFieldsToSelector : function(dimName) {
						return this.addAllFieldsOfDimensionToModelArea(dimName,
								sap.firefly.QContextType.SELECTOR);
					},
					addFieldToResultSet : function(dimName, fieldName) {
						return this.addField(null, dimName, null, fieldName,
								sap.firefly.QContextType.RESULT_SET);
					},
					addFieldToSelector : function(dimName, fieldName) {
						return this.addField(null, dimName, null, fieldName,
								sap.firefly.QContextType.SELECTOR);
					},
					clearAllResultSetFields : function(dimName) {
						return this.clearFields(null, dimName,
								sap.firefly.QContextType.RESULT_SET);
					},
					clearAllSelectorFields : function(dimName) {
						return this.clearFields(null, dimName,
								sap.firefly.QContextType.SELECTOR);
					},
					clearAllFields : function(dimName, contextType) {
						return this.clearFields(null, dimName, contextType);
					},
					clearFieldFromResultSet : function(dimName, fieldName) {
						return this.removeField(null, dimName, null, fieldName,
								sap.firefly.QContextType.RESULT_SET);
					},
					clearFieldFromSelector : function(dimName, fieldName) {
						return this.removeField(null, dimName, null, fieldName,
								sap.firefly.QContextType.SELECTOR);
					},
					containsResultSetField : function(dimName, fieldName) {
						return this.containsField(dimName, fieldName,
								sap.firefly.QContextType.RESULT_SET);
					},
					containsSelectorField : function(dimName, fieldName) {
						return this.containsField(dimName, fieldName,
								sap.firefly.QContextType.SELECTOR);
					},
					addPresentation : function(dimType, dimName,
							presentationType, contextType) {
						return this.addField(dimType, dimName,
								presentationType, null, contextType);
					},
					addMeasureFieldByTypeToResultSet : function(
							presentationType) {
						return this.addPresentation(
								sap.firefly.DimensionType.MEASURE_STRUCTURE,
								null, presentationType,
								sap.firefly.QContextType.RESULT_SET);
					},
					addMeasureFieldByTypeToSelector : function(presentationType) {
						return this.addPresentation(
								sap.firefly.DimensionType.MEASURE_STRUCTURE,
								null, presentationType,
								sap.firefly.QContextType.SELECTOR);
					},
					addFieldByTypeToResultSet : function(dimName,
							presentationType) {
						return this.addPresentation(null, dimName,
								presentationType,
								sap.firefly.QContextType.RESULT_SET);
					},
					addFieldByTypeToSelector : function(dimName,
							presentationType) {
						return this.addPresentation(null, dimName,
								presentationType,
								sap.firefly.QContextType.SELECTOR);
					},
					clearMeasureFieldByTypeFromResultSet : function(
							presentationType) {
						return this.removePresentation(
								sap.firefly.DimensionType.MEASURE_STRUCTURE,
								null, presentationType,
								sap.firefly.QContextType.RESULT_SET);
					},
					clearMeasureFieldByTypeFromSelector : function(
							presentationType) {
						return this.removePresentation(
								sap.firefly.DimensionType.MEASURE_STRUCTURE,
								null, presentationType,
								sap.firefly.QContextType.SELECTOR);
					},
					removePresentation : function(dimType, dimName,
							presentationType, contextType) {
						return this.removeField(dimType, dimName,
								presentationType, null, contextType);
					},
					clearFieldByTypeFromResultSet : function(dimName,
							presentationType) {
						return this.removePresentation(null, dimName,
								presentationType,
								sap.firefly.QContextType.RESULT_SET);
					},
					clearFieldByTypeFromSelector : function(dimName,
							presentationType) {
						return this.removePresentation(null, dimName,
								presentationType,
								sap.firefly.QContextType.SELECTOR);
					},
					showKey : function(dimName) {
						this.setField(null, dimName,
								sap.firefly.PresentationType.ACTIVE_KEY, null,
								sap.firefly.QContextType.RESULT_SET);
						return this;
					},
					showText : function(dimName) {
						this.setField(null, dimName,
								sap.firefly.PresentationType.ACTIVE_TEXT, null,
								sap.firefly.QContextType.RESULT_SET);
						return this;
					},
					showKeyAndText : function(dimName) {
						this.queueEventing();
						this.clearAllFields(dimName,
								sap.firefly.QContextType.RESULT_SET);
						this.addPresentation(null, dimName,
								sap.firefly.PresentationType.ACTIVE_KEY,
								sap.firefly.QContextType.RESULT_SET);
						this.addPresentation(null, dimName,
								sap.firefly.PresentationType.ACTIVE_TEXT,
								sap.firefly.QContextType.RESULT_SET);
						this.resumeEventing();
						return this;
					},
					showTextAndKey : function(dimName) {
						this.queueEventing();
						this.clearAllFields(dimName,
								sap.firefly.QContextType.RESULT_SET);
						this.addPresentation(null, dimName,
								sap.firefly.PresentationType.ACTIVE_TEXT,
								sap.firefly.QContextType.RESULT_SET);
						this.addPresentation(null, dimName,
								sap.firefly.PresentationType.ACTIVE_KEY,
								sap.firefly.QContextType.RESULT_SET);
						this.resumeEventing();
						return this;
					},
					alignTotalsOnTop : function(totalsController) {
						return this.alignTotals(totalsController
								.getModelLevel(), totalsController.getName(),
								sap.firefly.ResultAlignment.TOP);
					},
					alignTotalsOnBottom : function(totalsController) {
						return this.alignTotals(totalsController
								.getModelLevel(), totalsController.getName(),
								sap.firefly.ResultAlignment.BOTTOM);
					},
					alignTotalsOnTopAndBottom : function(totalsController) {
						return this.alignTotals(totalsController
								.getModelLevel(), totalsController.getName(),
								sap.firefly.ResultAlignment.TOPBOTTOM);
					},
					alignTotalsOnDefault : function(totalsController) {
						return this.alignTotals(totalsController
								.getModelLevel(), totalsController.getName(),
								null);
					},
					setTotalsVisibleOnDimension : function(dimName, visibility) {
						return this.setTotalsVisible(
								sap.firefly.QModelLevel.DIMENSIONS, dimName,
								visibility);
					},
					setTotalsVisibleOnAxis : function(axisType, visibility) {
						if (axisType !== null) {
							return this.setTotalsVisible(
									sap.firefly.QModelLevel.AXES, axisType
											.getName(), visibility);
						}
						return this;
					},
					clearSorting : function() {
						return this.clearSort(null, null);
					},
					clearDimensionSort : function(dimName) {
						return this.clearSort(
								sap.firefly.SortType.ABSTRACT_DIMENSION_SORT,
								dimName);
					},
					sortByKey : function(dimName, direction) {
						return this.sort(sap.firefly.SortType.MEMBER_KEY, null,
								dimName, null, null, null, direction);
					},
					sortByText : function(dimName, direction) {
						return this.sort(sap.firefly.SortType.MEMBER_TEXT,
								null, dimName, null, null, null, direction);
					},
					sortByHierarchy : function(dimName, direction) {
						return this.sort(sap.firefly.SortType.HIERARCHY, null,
								dimName, null, null, null, direction);
					},
					sortByMeasure : function(measureName, direction) {
						return this.sort(sap.firefly.SortType.MEASURE, null,
								null, null, null, measureName, direction);
					},
					sortByField : function(fieldName, direction) {
						return this.sort(sap.firefly.SortType.FIELD, null,
								null, null, fieldName, null, direction);
					},
					cloneOlapComponent : function(context, parent) {
						throw sap.firefly.XException
								.createUnsupportedOperationException();
					},
					getComponentType : function() {
					},
					isEventingStopped : function() {
					},
					queueEventing : function() {
					},
					resumeEventing : function() {
					},
					stopEventing : function() {
					},
					getOlapComponentType : function() {
					},
					registerChangedListener : function(arg1, arg2) {
					},
					unregisterChangedListener : function(arg1) {
					},
					getSession : function() {
					},
					getApplication : function() {
					},
					getQueryModel : function() {
					},
					getVariableContainer : function() {
					},
					getOlapEnv : function() {
					},
					getDimensionAccessor : function() {
					},
					getQueryManager : function() {
					},
					getDataSource : function() {
					},
					getDrillManager : function() {
					},
					getFieldAccessorSingle : function() {
					},
					getModelCapabilities : function() {
					},
					getDimension : function(arg1) {
					},
					getDimensionsContainingValueType : function(arg1) {
					},
					getField : function(arg1) {
					},
					getFirstDimensionWithType : function(arg1) {
					},
					getFirstGISDimension : function() {
					},
					getGISAttributesForDimension : function(arg1) {
					},
					getMeasure : function(arg1) {
					},
					select : function(arg1) {
					},
					addAllDimensions : function() {
					},
					clearAxis : function(arg1) {
					},
					moveDimensionExt : function(arg1, arg2, arg3, arg4) {
					},
					setDimensionAndMeasure : function(arg1, arg2) {
					},
					setDimensionsAndMeasures : function(arg1, arg2) {
					},
					switchAxes : function() {
					},
					addAllFieldsOfDimensionToModelArea : function(arg1, arg2) {
					},
					addAllFieldsToModelArea : function(arg1) {
					},
					addField : function(arg1, arg2, arg3, arg4, arg5) {
					},
					clearAllFieldsFromModelArea : function(arg1) {
					},
					clearFields : function(arg1, arg2, arg3) {
					},
					containsField : function(arg1, arg2, arg3) {
					},
					removeField : function(arg1, arg2, arg3, arg4, arg5) {
					},
					setField : function(arg1, arg2, arg3, arg4, arg5) {
					},
					addAttributeToResultSet : function(arg1, arg2) {
					},
					removeAttributeFromResultSet : function(arg1, arg2) {
					},
					containsResultSetFieldByType : function(arg1, arg2) {
					},
					containsSelectorFieldByType : function(arg1, arg2) {
					},
					clearSort : function(arg1, arg2) {
					},
					sort : function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
					},
					alignTotals : function(arg1, arg2, arg3) {
					},
					setTotalsVisible : function(arg1, arg2, arg3) {
					},
					addMeasure : function(arg1) {
					},
					addNewRestrictedMeasure : function(arg1, arg2, arg3, arg4,
							arg5, arg6) {
					},
					addNewRestrictedMeasureOnNode : function(arg1, arg2, arg3,
							arg4, arg5, arg6, arg7) {
					},
					addContainsGeometryFilter : function(arg1, arg2, arg3) {
					},
					addCoversGeometryFilter : function(arg1, arg2, arg3) {
					},
					addCrossesLinestringFilter : function(arg1, arg2, arg3) {
					},
					addDisjointGeometryFilter : function(arg1, arg2, arg3) {
					},
					addDoubleFilterByField : function(arg1, arg2, arg3) {
					},
					addDoubleFilterByFieldName : function(arg1, arg2, arg3,
							arg4) {
					},
					addFilter : function(arg1, arg2, arg3, arg4, arg5, arg6,
							arg7, arg8) {
					},
					addFilterByField : function(arg1, arg2, arg3, arg4, arg5,
							arg6) {
					},
					addFilterByFieldAndValue : function(arg1, arg2, arg3) {
					},
					addIntFilterByField : function(arg1, arg2, arg3) {
					},
					addIntFilterByFieldName : function(arg1, arg2, arg3, arg4) {
					},
					addIntersectsGeometryFilter : function(arg1, arg2, arg3) {
					},
					addIntersectsRectFilter : function(arg1, arg2, arg3, arg4) {
					},
					addIntervallFilterByValues : function(arg1, arg2, arg3) {
					},
					addLongFilterByField : function(arg1, arg2, arg3) {
					},
					addLongFilterByFieldName : function(arg1, arg2, arg3, arg4) {
					},
					addOverlapsGeometryFilter : function(arg1, arg2, arg3) {
					},
					addSingleMemberFilter : function(arg1, arg2, arg3, arg4,
							arg5) {
					},
					addSingleNodeFilter : function(arg1, arg2) {
					},
					addStringFilterByField : function(arg1, arg2, arg3) {
					},
					addStringFilterByFieldNameAndOperator : function(arg1,
							arg2, arg3, arg4) {
					},
					addStringFilterByName : function(arg1, arg2, arg3, arg4) {
					},
					addStringFilterByPresentation : function(arg1, arg2, arg3,
							arg4) {
					},
					addTouchesGeometryFilter : function(arg1, arg2, arg3) {
					},
					addWithinDistanceFilter : function(arg1, arg2, arg3, arg4,
							arg5) {
					},
					addWithinGeometryFilter : function(arg1, arg2, arg3) {
					},
					clearAllFiltersExt : function(arg1, arg2) {
					},
					clearFilterByIdExt : function(arg1, arg2) {
					},
					clearFiltersByDimensionExt : function(arg1, arg2, arg3) {
					},
					clearSingleMemberFilterByName : function(arg1, arg2, arg3) {
					},
					getFilterById : function(arg1) {
					},
					getVisibilityFilterById : function(arg1) {
					},
					setSearchTerm : function(arg1) {
					},
					getVariable : function(arg1) {
					},
					getVariablesNameAndText : function() {
					},
					setVariable : function(arg1, arg2) {
					},
					submitVariables : function() {
					},
					setDimensionHierarchy : function(arg1, arg2, arg3, arg4) {
					},
					getMaxRows : function() {
					},
					getOffsetRows : function() {
					},
					hasMoreRowRecordsAvailable : function() {
					},
					getExecuteRequestOnOldResultSet : function() {
					},
					getMaxColumns : function() {
					},
					getMaxResultRecords : function() {
					},
					getOffsetColumns : function() {
					},
					getResultSetPersistanceIdentifier : function() {
					},
					getResultSetPersistanceSchema : function() {
					},
					getResultSetPersistanceTable : function() {
					},
					hasMoreColumnRecordsAvailable : function() {
					},
					isResultSetPersistanceEnabled : function() {
					},
					isResultSetTransportEnabled : function() {
					},
					setMaxRows : function(arg1) {
					},
					setOffsetRows : function(arg1) {
					},
					resetMaxResultRecords : function() {
					},
					setExecuteRequestOnOldResultSet : function(arg1) {
					},
					setMaxColumns : function(arg1) {
					},
					setMaxResultRecords : function(arg1) {
					},
					setOffsetColumns : function(arg1) {
					},
					setResultSetPersistanceEnabled : function(arg1) {
					},
					setResultSetPersistanceIdentifier : function(arg1) {
					},
					setResultSetPersistanceTargetSchema : function(arg1) {
					},
					setResultSetPersistanceTargetTable : function(arg1) {
					},
					setResultSetTransportEnabled : function(arg1) {
					},
					getAbstractRendering : function(arg1) {
					},
					getReferenceGrid : function(arg1) {
					},
					processQueryExecution : function(arg1, arg2, arg3) {
					},
					refresh : function() {
					},
					executeCode : function(arg1) {
					},
					setTmxReplacementVariables : function(arg1, arg2, arg3,
							arg4) {
					},
					tmx : function(arg1) {
					},
					reset : function() {
					},
					resetToDefault : function() {
					},
					getReceiverBindings : function() {
					},
					getSenderBindings : function() {
					},
					newReceiverBinding : function(arg1) {
					},
					newSenderBinding : function(arg1) {
					},
					setActiveComponent : function(arg1) {
					}
				});
$Firefly
		.createClass(
				"sap.firefly.QCmdContext",
				sap.firefly.QCmdAbstract,
				{
					$statics : {
						createDummyContext : function() {
							return new sap.firefly.QCmdContext();
						}
					},
					m_target : null,
					releaseObject : function() {
						this.m_target = null;
						sap.firefly.QCmdContext.$superclass.releaseObject
								.call(this);
					},
					getOlapComponentType : function() {
						return null;
					},
					setActiveComponent : function(component) {
						return false;
					},
					setTarget : function(target) {
						this.m_target = target;
					},
					getComponentType : function() {
						if (this.m_target !== null) {
							return this.m_target.getComponentType();
						}
						return null;
					},
					getOlapEnv : function() {
						if (this.m_target !== null) {
							return this.m_target.getOlapEnv();
						}
						return null;
					},
					getApplication : function() {
						if (this.m_target !== null) {
							return this.m_target.getApplication();
						}
						return null;
					},
					getSession : function() {
						if (this.m_target !== null) {
							return this.m_target.getSession();
						}
						return null;
					},
					select : function(sigSelExpression) {
						if (this.m_target !== null) {
							return this.m_target.select(sigSelExpression);
						}
						return this;
					},
					getQueryModel : function() {
						if (this.m_target !== null) {
							return this.m_target.getQueryModel();
						}
						return null;
					},
					getDataSource : function() {
						if (this.m_target !== null) {
							return this.m_target.getDataSource();
						}
						return null;
					},
					getQueryManager : function() {
						if (this.m_target !== null) {
							return this.m_target.getQueryManager();
						}
						return null;
					},
					getDimensionAccessor : function() {
						if (this.m_target !== null) {
							return this.m_target.getDimensionAccessor();
						}
						return null;
					},
					getDimension : function(dimName) {
						if (this.m_target !== null) {
							return this.m_target.getDimension(dimName);
						}
						return null;
					},
					getField : function(name) {
						if (this.m_target !== null) {
							return this.m_target.getField(name);
						}
						return null;
					},
					getMeasure : function(name) {
						if (this.m_target !== null) {
							return this.m_target.getMeasure(name);
						}
						return null;
					},
					getFieldAccessorSingle : function() {
						if (this.m_target !== null) {
							return this.m_target.getFieldAccessorSingle();
						}
						return null;
					},
					getModelCapabilities : function() {
						if (this.m_target !== null) {
							return this.m_target.getModelCapabilities();
						}
						return null;
					},
					getFirstGISDimension : function() {
						if (this.m_target !== null) {
							return this.m_target.getFirstGISDimension();
						}
						return null;
					},
					getFirstDimensionWithType : function(dimensionType) {
						if (this.m_target !== null) {
							return this.m_target
									.getFirstDimensionWithType(dimensionType);
						}
						return null;
					},
					getGISAttributesForDimension : function(dim) {
						if (this.m_target !== null) {
							return this.m_target
									.getGISAttributesForDimension(dim);
						}
						return null;
					},
					getDimensionsContainingValueType : function(valueType) {
						if (this.m_target !== null) {
							return this.m_target
									.getDimensionsContainingValueType(valueType);
						}
						return null;
					},
					getDrillManager : function() {
						if (this.m_target !== null) {
							return this.m_target.getDrillManager();
						}
						return null;
					},
					registerChangedListener : function(listener,
							customIdentifier) {
						if (this.m_target !== null) {
							return this.m_target.registerChangedListener(
									listener, customIdentifier);
						}
						return this;
					},
					unregisterChangedListener : function(listener) {
						if (this.m_target !== null) {
							return this.m_target
									.unregisterChangedListener(listener);
						}
						return this;
					},
					getSenderBindings : function() {
						if (this.m_target !== null) {
							this.m_target.getSenderBindings();
						}
						return null;
					},
					getReceiverBindings : function() {
						if (this.m_target !== null) {
							return this.m_target.getReceiverBindings();
						}
						return null;
					},
					newSenderBinding : function(type) {
						if (this.m_target !== null) {
							this.m_target.newSenderBinding(type);
						}
						return null;
					},
					newReceiverBinding : function(type) {
						if (this.m_target !== null) {
							this.m_target.newReceiverBinding(type);
						}
						return null;
					},
					reset : function() {
						if (this.m_target !== null) {
							this.m_target.reset();
						}
					},
					resetToDefault : function() {
						if (this.m_target !== null) {
							this.m_target.resetToDefault();
						}
					},
					addFilter : function(filterLayer, dimType, dimName,
							presentationType, fieldName, lowValue, highValue,
							comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addFilter(filterLayer,
									dimType, dimName, presentationType,
									fieldName, lowValue, highValue,
									comparisonOperator);
						}
						return null;
					},
					clearAllFiltersExt : function(filterLayer,
							filterScopeVariables) {
						if (this.m_target !== null) {
							return this.m_target.clearAllFiltersExt(
									filterLayer, filterScopeVariables);
						}
						return this;
					},
					clearFiltersByDimensionExt : function(filterLayer, dimType,
							dimName) {
						if (this.m_target !== null) {
							return this.m_target.clearFiltersByDimensionExt(
									filterLayer, dimType, dimName);
						}
						return this;
					},
					clearSingleMemberFilterByName : function(dimName,
							memberName, comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.clearSingleMemberFilterByName(
									dimName, memberName, comparisonOperator);
						}
						return this;
					},
					clearFilterByIdExt : function(filterLayer, uniqueId) {
						if (this.m_target !== null) {
							return this.m_target.clearFilterByIdExt(
									filterLayer, uniqueId);
						}
						return this;
					},
					addSingleMemberFilter : function(filterLayer, dimType,
							dimName, memberName, comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addSingleMemberFilter(
									filterLayer, dimType, dimName, memberName,
									comparisonOperator);
						}
						return null;
					},
					addSingleNodeFilter : function(node, comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addSingleNodeFilter(node,
									comparisonOperator);
						}
						return null;
					},
					addStringFilterByField : function(field, filterValue,
							comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addStringFilterByField(field,
									filterValue, comparisonOperator);
						}
						return null;
					},
					addFilterByFieldAndValue : function(field, filterValue,
							comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addFilterByFieldAndValue(
									field, filterValue, comparisonOperator);
						}
						return null;
					},
					addStringFilterByFieldNameAndOperator : function(
							dimensionName, fieldName, filterValue,
							comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target
									.addStringFilterByFieldNameAndOperator(
											dimensionName, fieldName,
											filterValue, comparisonOperator);
						}
						return null;
					},
					addIntFilterByFieldName : function(dimensionName,
							fieldName, filterValue, comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addIntFilterByFieldName(
									dimensionName, fieldName, filterValue,
									comparisonOperator);
						}
						return null;
					},
					addIntFilterByField : function(field, filterValue,
							comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addIntFilterByField(field,
									filterValue, comparisonOperator);
						}
						return null;
					},
					addDoubleFilterByFieldName : function(dimensionName,
							fieldName, filterValue, comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addDoubleFilterByFieldName(
									dimensionName, fieldName, filterValue,
									comparisonOperator);
						}
						return null;
					},
					addDoubleFilterByField : function(field, filterValue,
							comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addDoubleFilterByField(field,
									filterValue, comparisonOperator);
						}
						return null;
					},
					addLongFilterByFieldName : function(dimensionName,
							fieldName, filterValue, comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addLongFilterByFieldName(
									dimensionName, fieldName, filterValue,
									comparisonOperator);
						}
						return null;
					},
					addLongFilterByField : function(field, filterValue,
							comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addLongFilterByField(field,
									filterValue, comparisonOperator);
						}
						return null;
					},
					addStringFilterByName : function(dimensionName, fieldName,
							filterValue, comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addStringFilterByName(
									dimensionName, fieldName, filterValue,
									comparisonOperator);
						}
						return null;
					},
					addStringFilterByPresentation : function(dimensionName,
							presentationType, filterValue, comparisonOperator) {
						if (this.m_target !== null) {
							return this.m_target.addStringFilterByPresentation(
									dimensionName, presentationType,
									filterValue, comparisonOperator);
						}
						return null;
					},
					addIntervallFilterByValues : function(dimensionName,
							lowValue, highValue) {
						if (this.m_target !== null) {
							return this.m_target.addIntervallFilterByValues(
									dimensionName, lowValue, highValue);
						}
						return null;
					},
					setSearchTerm : function(searchTerm) {
						if (this.m_target !== null) {
							return this.m_target.setSearchTerm(searchTerm);
						}
						return this;
					},
					addWithinDistanceFilter : function(dimension, fieldName,
							point, distance, unit) {
						if (this.m_target !== null) {
							return this.m_target
									.addWithinDistanceFilter(dimension,
											fieldName, point, distance, unit);
						}
						return null;
					},
					addIntersectsRectFilter : function(dimension, fieldName,
							lowerLeft, upperRight) {
						if (this.m_target !== null) {
							return this.m_target
									.addIntersectsRectFilter(dimension,
											fieldName, lowerLeft, upperRight);
						}
						return null;
					},
					addContainsGeometryFilter : function(dimension, fieldName,
							geometry) {
						if (this.m_target !== null) {
							return this.m_target.addContainsGeometryFilter(
									dimension, fieldName, geometry);
						}
						return null;
					},
					addIntersectsGeometryFilter : function(dimension,
							fieldName, geometry) {
						if (this.m_target !== null) {
							return this.m_target.addIntersectsGeometryFilter(
									dimension, fieldName, geometry);
						}
						return null;
					},
					addCoversGeometryFilter : function(dimension, fieldName,
							geometry) {
						if (this.m_target !== null) {
							return this.m_target.addCoversGeometryFilter(
									dimension, fieldName, geometry);
						}
						return null;
					},
					addCrossesLinestringFilter : function(dimension, fieldName,
							geometry) {
						if (this.m_target !== null) {
							return this.m_target.addCrossesLinestringFilter(
									dimension, fieldName, geometry);
						}
						return null;
					},
					addDisjointGeometryFilter : function(dimension, fieldName,
							geometry) {
						if (this.m_target !== null) {
							return this.m_target.addDisjointGeometryFilter(
									dimension, fieldName, geometry);
						}
						return null;
					},
					addOverlapsGeometryFilter : function(dimension, fieldName,
							geometry) {
						if (this.m_target !== null) {
							return this.m_target.addOverlapsGeometryFilter(
									dimension, fieldName, geometry);
						}
						return null;
					},
					addTouchesGeometryFilter : function(dimension, fieldName,
							geometry) {
						if (this.m_target !== null) {
							return this.m_target.addTouchesGeometryFilter(
									dimension, fieldName, geometry);
						}
						return null;
					},
					addWithinGeometryFilter : function(dimension, fieldName,
							geometry) {
						if (this.m_target !== null) {
							return this.m_target.addWithinGeometryFilter(
									dimension, fieldName, geometry);
						}
						return null;
					},
					getFilterById : function(uniqueId) {
						if (this.m_target !== null) {
							return this.m_target.getFilterById(uniqueId);
						}
						return null;
					},
					getVisibilityFilterById : function(uniqueId) {
						if (this.m_target !== null) {
							return this.m_target
									.getVisibilityFilterById(uniqueId);
						}
						return null;
					},
					addFilterByField : function(field, firstValue, secondValue,
							thirdValue, comparisonOperator, isVisibility) {
						if (this.m_target !== null) {
							return this.m_target.addFilterByField(field,
									firstValue, secondValue, thirdValue,
									comparisonOperator, isVisibility);
						}
						return null;
					},
					getVariablesNameAndText : function() {
						if (this.m_target !== null) {
							return this.m_target.getVariablesNameAndText();
						}
						return null;
					},
					setVariable : function(name, value) {
						if (this.m_target !== null) {
							return this.m_target.setVariable(name, value);
						}
						return this;
					},
					submitVariables : function() {
						if (this.m_target !== null) {
							return this.m_target.submitVariables();
						}
						return null;
					},
					getVariable : function(name) {
						if (this.m_target !== null) {
							return this.m_target.getVariable(name);
						}
						return null;
					},
					getVariableContainer : function() {
						if (this.m_target !== null) {
							return this.m_target.getVariableContainer();
						}
						return null;
					},
					switchAxes : function() {
						if (this.m_target !== null) {
							return this.m_target.switchAxes();
						}
						return this;
					},
					clearAxis : function(targetAxis) {
						if (this.m_target !== null) {
							return this.m_target.clearAxis(targetAxis);
						}
						return this;
					},
					setDimensionsAndMeasures : function(dimNames, measures) {
						if (this.m_target !== null) {
							return this.m_target.setDimensionsAndMeasures(
									dimNames, measures);
						}
						return this;
					},
					setDimensionAndMeasure : function(dimName, measure) {
						if (this.m_target !== null) {
							return this.m_target.setDimensionAndMeasure(
									dimName, measure);
						}
						return this;
					},
					moveDimensionExt : function(dimType, dimName, targetAxis,
							index) {
						if (this.m_target !== null) {
							return this.m_target.moveDimensionExt(dimType,
									dimName, targetAxis, index);
						}
						return null;
					},
					addAllDimensions : function() {
						if (this.m_target !== null) {
							return this.m_target.addAllDimensions();
						}
						return this;
					},
					addAttributeToResultSet : function(dimName, attributeName) {
						if (this.m_target !== null) {
							return this.m_target.addAttributeToResultSet(
									dimName, attributeName);
						}
						return null;
					},
					removeAttributeFromResultSet : function(dimName,
							attributeName) {
						if (this.m_target !== null) {
							return this.m_target.removeAttributeFromResultSet(
									dimName, attributeName);
						}
						return null;
					},
					addField : function(dimType, dimName, presentationType,
							fieldName, contextType) {
						if (this.m_target !== null) {
							return this.m_target.addField(dimType, dimName,
									presentationType, fieldName, contextType);
						}
						return null;
					},
					setField : function(dimType, dimName, presentationType,
							fieldName, contextType) {
						if (this.m_target !== null) {
							return this.m_target.setField(dimType, dimName,
									presentationType, fieldName, contextType);
						}
						return null;
					},
					addAllFieldsToModelArea : function(contextType) {
						if (this.m_target !== null) {
							return this.m_target
									.addAllFieldsToModelArea(contextType);
						}
						return this;
					},
					clearAllFieldsFromModelArea : function(contextType) {
						if (this.m_target !== null) {
							return this.m_target
									.clearAllFieldsFromModelArea(contextType);
						}
						return this;
					},
					addAllFieldsOfDimensionToModelArea : function(dimName,
							contextType) {
						if (this.m_target !== null) {
							return this.m_target
									.addAllFieldsOfDimensionToModelArea(
											dimName, contextType);
						}
						return this;
					},
					clearFields : function(dimType, dimName, contextType) {
						if (this.m_target !== null) {
							return this.m_target.clearFields(dimType, dimName,
									contextType);
						}
						return this;
					},
					removeField : function(dimType, dimName, presentationType,
							fieldName, contextType) {
						if (this.m_target !== null) {
							return this.m_target.removeField(dimType, dimName,
									presentationType, fieldName, contextType);
						}
						return null;
					},
					containsField : function(dimName, fieldName, contextType) {
						if (this.m_target !== null) {
							return this.m_target.containsField(dimName,
									fieldName, contextType);
						}
						return false;
					},
					containsResultSetFieldByType : function(dimName,
							presentationType) {
						if (this.m_target !== null) {
							return this.m_target.containsResultSetFieldByType(
									dimName, presentationType);
						}
						return false;
					},
					containsSelectorFieldByType : function(dimName,
							presentationType) {
						if (this.m_target !== null) {
							return this.m_target.containsSelectorFieldByType(
									dimName, presentationType);
						}
						return false;
					},
					setDimensionHierarchy : function(dimName, hierarchyName,
							hierarchyActive, initialDrillLevel) {
						if (this.m_target !== null) {
							return this.m_target.setDimensionHierarchy(dimName,
									hierarchyName, hierarchyActive,
									initialDrillLevel);
						}
						return this;
					},
					sort : function(sortType, dimType, dimName,
							presentationType, fieldName, memberName, direction) {
						if (this.m_target !== null) {
							return this.m_target.sort(sortType, dimType,
									dimName, presentationType, fieldName,
									memberName, direction);
						}
						return this;
					},
					clearSort : function(sortType, name) {
						if (this.m_target !== null) {
							return this.m_target.clearSort(sortType, name);
						}
						return this;
					},
					alignTotals : function(modelLevel, name, alignment) {
						if (this.m_target !== null) {
							return this.m_target.alignTotals(modelLevel, name,
									alignment);
						}
						return this;
					},
					setTotalsVisible : function(modelLevel, name, visibility) {
						if (this.m_target !== null) {
							return this.m_target.setTotalsVisible(modelLevel,
									name, visibility);
						}
						return this;
					},
					addMeasure : function(measure) {
						if (this.m_target !== null) {
							return this.m_target.addMeasure(measure);
						}
						return null;
					},
					addNewRestrictedMeasure : function(dimType, name, text,
							member, targetDim, targetMember) {
						if (this.m_target !== null) {
							return this.m_target.addNewRestrictedMeasure(
									dimType, name, text, member, targetDim,
									targetMember);
						}
						return this;
					},
					addNewRestrictedMeasureOnNode : function(dimType, name,
							text, member, targetDim, targetHierarchyName,
							targetNode) {
						if (this.m_target !== null) {
							return this.m_target.addNewRestrictedMeasureOnNode(
									dimType, name, text, member, targetDim,
									targetHierarchyName, targetNode);
						}
						return this;
					},
					tmx : function(expression) {
						if (this.m_target !== null) {
							return this.m_target.tmx(expression);
						}
						return null;
					},
					setTmxReplacementVariables : function(variables, varPrefix,
							varPostfix, lookupNamespace) {
						if (this.m_target !== null) {
							this.m_target.setTmxReplacementVariables(variables,
									varPrefix, varPostfix, lookupNamespace);
						}
					},
					executeCode : function(structure) {
						if (this.m_target !== null) {
							this.m_target.executeCode(structure);
						}
					},
					getOffsetColumns : function() {
						if (this.m_target !== null) {
							return this.m_target.getOffsetColumns();
						}
						return 0;
					},
					getMaxColumns : function() {
						if (this.m_target !== null) {
							return this.m_target.getMaxColumns();
						}
						return 0;
					},
					setOffsetColumns : function(offset) {
						if (this.m_target !== null) {
							return this.m_target.setOffsetColumns(offset);
						}
						return this;
					},
					setMaxColumns : function(max) {
						if (this.m_target !== null) {
							return this.m_target.setMaxColumns(max);
						}
						return this;
					},
					getOffsetRows : function() {
						if (this.m_target !== null) {
							return this.m_target.getOffsetRows();
						}
						return 0;
					},
					getMaxRows : function() {
						if (this.m_target !== null) {
							return this.m_target.getMaxRows();
						}
						return 0;
					},
					setOffsetRows : function(offset) {
						if (this.m_target !== null) {
							return this.m_target.setOffsetRows(offset);
						}
						return this;
					},
					setMaxRows : function(max) {
						if (this.m_target !== null) {
							return this.m_target.setMaxRows(max);
						}
						return this;
					},
					getMaxResultRecords : function() {
						if (this.m_target !== null) {
							return this.m_target.getMaxResultRecords();
						}
						return 0;
					},
					setMaxResultRecords : function(maxResultRecords) {
						if (this.m_target !== null) {
							return this.m_target
									.setMaxResultRecords(maxResultRecords);
						}
						return this;
					},
					resetMaxResultRecords : function() {
						if (this.m_target !== null) {
							return this.m_target.resetMaxResultRecords();
						}
						return this;
					},
					hasMoreColumnRecordsAvailable : function() {
						if (this.m_target !== null) {
							return false;
						}
						return this.m_target.hasMoreColumnRecordsAvailable();
					},
					hasMoreRowRecordsAvailable : function() {
						if (this.m_target !== null) {
							return this.m_target.hasMoreRowRecordsAvailable();
						}
						return false;
					},
					getReferenceGrid : function(withDetails) {
						if (this.m_target !== null) {
							this.m_target.getReferenceGrid(withDetails);
						}
						return null;
					},
					getAbstractRendering : function(type) {
						if (this.m_target !== null) {
							return this.m_target.getAbstractRendering(type);
						}
						return null;
					},
					setExecuteRequestOnOldResultSet : function(
							executeRequestOnOldResultSet) {
						if (this.m_target !== null) {
							return this.m_target
									.setExecuteRequestOnOldResultSet(executeRequestOnOldResultSet);
						}
						return this;
					},
					setResultSetPersistanceTargetSchema : function(
							resultSetPersistanceSchema) {
						if (this.m_target !== null) {
							return this.m_target
									.setResultSetPersistanceTargetSchema(resultSetPersistanceSchema);
						}
						return this;
					},
					setResultSetPersistanceTargetTable : function(
							resultSetPersistanceTable) {
						if (this.m_target !== null) {
							return this.m_target
									.setResultSetPersistanceTargetTable(resultSetPersistanceTable);
						}
						return this;
					},
					setResultSetPersistanceIdentifier : function(
							resultSetPersistanceIdentifier) {
						if (this.m_target !== null) {
							return this.m_target
									.setResultSetPersistanceIdentifier(resultSetPersistanceIdentifier);
						}
						return this;
					},
					setResultSetPersistanceEnabled : function(
							resultSetPersistanceEnabled) {
						if (this.m_target !== null) {
							return this.m_target
									.setResultSetPersistanceEnabled(resultSetPersistanceEnabled);
						}
						return this;
					},
					setResultSetTransportEnabled : function(isEnabled) {
						if (this.m_target !== null) {
							return this.m_target
									.setResultSetTransportEnabled(isEnabled);
						}
						return this;
					},
					getExecuteRequestOnOldResultSet : function() {
						if (this.m_target !== null) {
							return this.m_target
									.getExecuteRequestOnOldResultSet();
						}
						return false;
					},
					processQueryExecution : function(syncType, listener,
							customIdentifier) {
						if (this.m_target !== null) {
							this.m_target.processQueryExecution(syncType,
									listener, customIdentifier);
						}
						return this;
					},
					refresh : function() {
						if (this.m_target !== null) {
							return this.m_target.refresh();
						}
						return this;
					},
					getResultSetPersistanceSchema : function() {
						if (this.m_target !== null) {
							return this.m_target
									.getResultSetPersistanceSchema();
						}
						return null;
					},
					getResultSetPersistanceTable : function() {
						if (this.m_target !== null) {
							return this.m_target.getResultSetPersistanceTable();
						}
						return null;
					},
					getResultSetPersistanceIdentifier : function() {
						if (this.m_target !== null) {
							return this.m_target
									.getResultSetPersistanceIdentifier();
						}
						return null;
					},
					isResultSetPersistanceEnabled : function() {
						if (this.m_target !== null) {
							return this.m_target
									.isResultSetPersistanceEnabled();
						}
						return false;
					},
					isResultSetTransportEnabled : function() {
						if (this.m_target !== null) {
							return this.m_target.isResultSetTransportEnabled();
						}
						return false;
					},
					queueEventing : function() {
						if (this.m_target !== null) {
							this.m_target.queueEventing();
						}
					},
					stopEventing : function() {
						if (this.m_target !== null) {
							this.m_target.stopEventing();
						}
					},
					isEventingStopped : function() {
						if (this.m_target !== null) {
							return this.m_target.isEventingStopped();
						}
						return false;
					},
					resumeEventing : function() {
						if (this.m_target !== null) {
							this.m_target.resumeEventing();
						}
					}
				});
$Firefly
		.createClass(
				"sap.firefly.OlapExtModule",
				sap.firefly.DfModule,
				{
					$statics : {
						s_module : null,
						getInstance : function() {
							return sap.firefly.OlapExtModule
									.initVersion(sap.firefly.XVersion.API_DEFAULT);
						},
						initVersion : function(version) {
							if (sap.firefly.OlapExtModule.s_module === null) {
								if (sap.firefly.OlapApiModule
										.initVersion(version) === null) {
									throw sap.firefly.XException
											.createInitializationException();
								}
								sap.firefly.OlapExtModule.s_module = new sap.firefly.OlapExtModule();
								sap.firefly.TmxFactoryImpl.staticSetup();
								sap.firefly.TmxTokenType.staticSetup();
							}
							return sap.firefly.OlapExtModule.s_module;
						}
					}
				});
sap.firefly.OlapExtModule.getInstance();