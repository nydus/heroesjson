#include "cascextract.h"

#include "../../CascLib/src/CascLib.h"

void cascextract(void)
{
	HANDLE hStorage;
	bool result;

	result = CascOpenStorage(gConfig.dataPath, CASC_LOCALE_ENUS, &hStorage);
	if(!result)
	{
		printf("error!\n");
	}
    //bool  WINAPI CascOpenStorage(const TCHAR * szDataPath, DWORD dwLocaleMask, HANDLE * phStorage);

}