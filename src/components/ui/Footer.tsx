import React from 'react';
import { Box, Text } from 'ink';

export const Footer: React.FC = () => {
	return (
		<Box
			borderStyle='round'
			borderColor='gray'
			paddingX={1}
			paddingY={0}
			flexDirection='row'
			alignItems='center'
			justifyContent='space-between'
		>
			<Box>
				<Text bold={true} color='cyan'>↑/↓</Text><Text> Navigate</Text>
				<Text>  </Text>
				<Text bold={true} color='cyan'>A</Text><Text> Add</Text>
				<Text>  </Text>
				<Text bold={true} color='cyan'>P</Text><Text> Pause</Text>
				<Text>  </Text>
				<Text bold={true} color='cyan'>R</Text><Text> Resume</Text>
				<Text>  </Text>
			</Box>

			<Box>
				<Text bold={true} color='cyan'>D</Text><Text> Delete</Text>
				<Text>  </Text>
				<Text bold={true} color='cyan'>ESC</Text><Text> Cancel</Text>
				<Text>  </Text>
				<Text bold={true} color='cyan'>Q</Text><Text> Quit</Text>
			</Box>
		</Box>
	)
};
