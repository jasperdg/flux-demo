import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { FluxContext } from './../FluxProvider';
import { dollarsToDai, outcomeToTag } from '../../utils/unitConvertion';
import Countdown from 'react-countdown-now';
import GovernanceAction from './GovernanceAction';
import DisputeTimer from './DisputeTimer';
import StandardTXLoader, { DEFAULT_STATE } from '../StandardTxLoader';
import { Error } from './Resolute';

const Container = styled.div``
const CurrentOutcome = styled.h3``
const Title = styled.h1``

function Dispute({ data, getAndSetMarkets }) {
	const [{flux}, dispatch] = useContext(FluxContext)
	const [newWinningOutcome, setNewWinningOutcome] = useState(false);
	const [isLoading, setIsLoading] = useState(DEFAULT_STATE);
	const [errorMsg, setErrorMsg] = useState(null);

	const handleDispute = async (e) => {
		e.preventDefault();
		
		if (newWinningOutcome === false || newWinningOutcome >= data.outcomes) {
			return setErrorMsg("Please select an outcome")
		} else {
			setErrorMsg(null)
		}

		setIsLoading({loading: true, res: null, err: null});

		flux.dispute(data.id, newWinningOutcome, dollarsToDai(10))
		.then( async res => {
			setIsLoading({ loading: false, res: "success", err: false })
			getAndSetMarkets();
			const updatedBalance = await flux.getFDaiBalance().catch(err => console.error(err));
			dispatch({type: "balanceUpdate", payload: {balance: updatedBalance}});
		})
		.catch(err => {
			console.error(err)
			setIsLoading({ loading: false, res: "oops, something went wrong", err: true })
		})
	};

	const closeLoader = () => {
		setIsLoading(DEFAULT_STATE)
	}

	return (
		<Container>
			<Title>DISPUTABLE: {data.description}</Title>
			<span>Dispute window open for: </span>
			<Countdown zeroPadTime={2} date={data.resolution_windows[data.resolution_windows.length - 1].end_time} renderer={DisputeTimer}/>
			<CurrentOutcome>Last outcome: {outcomeToTag(data.winning_outcome, data.outcome_tags)}</CurrentOutcome>
			<GovernanceAction
				onSubmit={handleDispute} 
				actionName="dispute" 
				data={data}
				setNewWinningOutcome={setNewWinningOutcome}
				newWinningOutcome={newWinningOutcome}
			/>
			<Error>{errorMsg}</Error>
			{(isLoading.loading || isLoading.res) && <StandardTXLoader res={isLoading.res} err={isLoading.err} closeLoader={closeLoader} />}
		</Container>
	)
}

export default Dispute