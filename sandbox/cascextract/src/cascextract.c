#include "cascextract.h"

#include "../../CascLib/src/CascLib.h"

void cascextract(void)
{
	HANDLE hStorage;
	bool result;

	printf("Opening: %s\n", gConfig.dataPath);

	result = CascOpenStorage(_T(gConfig.dataPath), 0, &hStorage);
	if(!result)
	{
		printf("error! %s\n", strerror(GetLastError()));
	}
    //bool  WINAPI CascOpenStorage(const TCHAR * szDataPath, DWORD dwLocaleMask, HANDLE * phStorage);

}