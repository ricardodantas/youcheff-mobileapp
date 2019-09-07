import React, { Component } from 'react';
import styled from 'styled-components';

const View = styled.View`
  flex: 1;
  justifyContent: center;
  alignItems: center;
  backgroundColor: ${props => props.theme.MAIN_BACKGROUND_COLOR};
`;

export default View;
