
module.exports = {
    'name': 'ready',
    'run': Connection => {
        Connection.isReady = () => true;
        console.log('Ready.');
    }
};